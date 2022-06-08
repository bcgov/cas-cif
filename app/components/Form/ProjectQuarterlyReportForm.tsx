import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import StatusBadge from "components/StatusBadge";
import projectReportingRequirementSchema from "data/jsonSchemaForm/projectReportingRequirementSchema";
import { JSONSchema7 } from "json-schema";
import {
  determineVariant,
  isOverdue,
} from "lib/helpers/calculateReportDeadlines";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision.ts";
import useDiscardReportingRequirementFormChange from "mutations/ProjectReportingRequirement/discardReportingRequirementFormChange";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectQuarterlyReportForm_projectRevision$key } from "__generated__/ProjectQuarterlyReportForm_projectRevision.graphql";
import FormBase from "./FormBase";
import {
  addReportFormChange,
  deleteReportFormChange,
  getSortedReports,
  stageReportFormChanges,
  updateReportFormChange,
} from "./reportingRequirementFormChangeFunctions";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectQuarterlyReportForm_projectRevision$key;
}

const quarterlyReportUiSchema = {
  reportDueDate: {
    "ui:widget": "DueDateWidget",
  },
  submittedDate: {
    "ui:widget": "ReceivedDateWidget",
  },
  comments: {
    "ui:widget": "TextAreaWidget",
  },
};

const ProjectQuarterlyReportForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectQuarterlyReportForm_projectRevision on ProjectRevision {
        id
        rowId
        projectQuarterlyReportFormChanges(first: 502)
          @connection(key: "connection_projectQuarterlyReportFormChanges") {
          __id
          edges {
            node {
              rowId
              id
              newFormData
              operation
              changeStatus
            }
          }
        }
        upcomingQuarterlyReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Quarterly"
        ) {
          ...ReportDueIndicator_formChange
          asReportingRequirement {
            reportDueDate
          }
        }
        projectFormChange {
          formDataRecordId
        }
      }
    `,
    props.projectRevision
  );

  // TODO: make it a reusable hook
  // this aims to delete the form reference from the formRefs object when hitting the undo changes button
  useEffect(() => {
    Object.keys(formRefs.current).forEach((key) => {
      if (!formRefs.current[key]) delete formRefs.current[key];
    });
  }, [projectRevision.projectQuarterlyReportFormChanges]);

  const [addQuarterlyReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const [discardFormChange] = useDiscardReportingRequirementFormChange(
    "Quarterly",
    projectRevision.projectQuarterlyReportFormChanges.__id
  );

  const [sortedQuarterlyReports, nextQuarterlyReportIndex] = useMemo(() => {
    return getSortedReports(
      projectRevision.projectQuarterlyReportFormChanges.edges
    );
  }, [projectRevision.projectQuarterlyReportFormChanges]);

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.projectQuarterlyReportFormChanges.edges.map(
      ({ node }) => node?.rowId
    );
  }, [projectRevision.projectQuarterlyReportFormChanges]);

  const overdue = isOverdue(
    projectRevision.upcomingQuarterlyReportFormChange?.asReportingRequirement
      .reportDueDate
  );

  const variant = determineVariant(
    projectRevision.projectQuarterlyReportFormChanges,
    overdue
  );

  return (
    <div>
      <header>
        <h2>Quarterly Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} />
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>
      <h3>Status</h3>
      Status of Quarterly Reports <StatusBadge variant={variant} />
      <ReportDueIndicator
        reportTitle="Quarterly Report"
        reportDueFormChange={projectRevision.upcomingQuarterlyReportFormChange}
      />
      <FormBorder>
        <Button
          variant="secondary"
          onClick={() =>
            addReportFormChange(
              addQuarterlyReportMutation,
              projectRevision,
              nextQuarterlyReportIndex,
              "Quarterly",
              projectRevision.projectQuarterlyReportFormChanges.__id
            )
          }
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another quarterly report
        </Button>

        {sortedQuarterlyReports.map((quarterlyReport, index) => {
          return (
            <div key={quarterlyReport.id} className="reportContainer">
              <header className="reportHeader">
                <h3>Quarterly Report {index + 1}</h3>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteReportFormChange(
                      discardFormChange,
                      quarterlyReport.id,
                      quarterlyReport.operation,
                      formRefs
                    )
                  }
                >
                  Remove
                </Button>
              </header>
              <FormBase
                id={`form-${quarterlyReport.id}`}
                idPrefix={`form-${quarterlyReport.id}`}
                ref={(el) => (formRefs.current[quarterlyReport.id] = el)}
                formData={quarterlyReport.newFormData}
                onChange={(change) => {
                  updateReportFormChange(
                    applyUpdateFormChangeMutation,
                    "Quarterly",
                    { ...quarterlyReport, changeStatus: "pending" },
                    change.formData
                  );
                }}
                schema={projectReportingRequirementSchema as JSONSchema7}
                uiSchema={quarterlyReportUiSchema}
                ObjectFieldTemplate={EmptyObjectFieldTemplate}
                formContext={{
                  dueDate: quarterlyReport.newFormData?.reportDueDate,
                }}
              />
            </div>
          );
        })}
      </FormBorder>
      <Button
        size="medium"
        variant="primary"
        onClick={() =>
          stageReportFormChanges(
            applyUpdateFormChangeMutation,
            "Quarterly",
            props.onSubmit,
            formRefs,
            projectRevision.projectQuarterlyReportFormChanges.edges
          )
        }
        disabled={isUpdating}
      >
        Submit Quarterly Reports
      </Button>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div.reportContainer {
          border-top: 1px solid black;
          padding-top: 1em;
        }
        div :global(button.addButton) {
          margin-bottom: 1em;
        }
        header.reportHeader {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
};

export default ProjectQuarterlyReportForm;
