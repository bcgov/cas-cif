import { Button } from "@button-inc/bcgov-theme";
import { faCheck, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import {
  projectReportingRequirementSchema,
  reportingRequirementUiSchema,
} from "data/jsonSchemaForm/projectReportingRequirementSchema";
import { JSONSchema7 } from "json-schema";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision";
import useDiscardReportingRequirementFormChange from "mutations/ProjectReportingRequirement/discardReportingRequirementFormChange";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useStageReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/stageReportingRequirementFormChange";
import { MutableRefObject, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectAnnualReportForm_projectRevision$key } from "__generated__/ProjectAnnualReportForm_projectRevision.graphql";
import FormBase from "./FormBase";
import {
  addReportFormChange,
  deleteReportFormChange,
  getSortedReports,
  stageReportFormChanges,
  updateReportFormChange,
} from "./Functions/reportingRequirementFormChangeFunctions";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectAnnualReportForm_projectRevision$key;
}

export const annualReportUiSchema = {
  ...reportingRequirementUiSchema,
  submittedDate: {
    ...reportingRequirementUiSchema.submittedDate,
    contentPrefix: (
      <div>
        <span style={{ marginRight: "1em" }}>Received</span>
        <FontAwesomeIcon icon={faCheck} color={"green"} />
      </div>
    ),
  },
};

const ProjectAnnualReportForm: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectAnnualReportForm_projectRevision on ProjectRevision {
        id
        rowId
        projectAnnualReportFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Annual"
          first: 502
        ) @connection(key: "connection_projectAnnualReportFormChanges") {
          __id
          edges {
            # eslint-disable-next-line relay/unused-fields
            node {
              rowId
              id
              newFormData
              operation
              changeStatus
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
              asReportingRequirement {
                ...CollapsibleReport_reportingRequirement
              }
            }
          }
        }

        upcomingAnnualReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Annual"
        ) {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...ReportDueIndicator_formChange
          asReportingRequirement {
            reportDueDate
          }
        }
        # eslint-disable-next-line relay/unused-fields
        projectFormChange {
          formDataRecordId
        }
      }
    `,
    props.projectRevision
  );

  const [addAnnualReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const [applyStageFormChangeMutation, isStaging] =
    useStageReportingRequirementFormChange();

  const [discardFormChange] = useDiscardReportingRequirementFormChange(
    "Annual",
    projectRevision.projectAnnualReportFormChanges.__id
  );

  const [sortedAnnualReports, nextAnnualReportIndex] = useMemo(() => {
    return getSortedReports(
      projectRevision.projectAnnualReportFormChanges.edges
    );
  }, [projectRevision.projectAnnualReportFormChanges]);

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.projectAnnualReportFormChanges.edges.map(
      ({ node }) => node?.rowId
    );
  }, [projectRevision.projectAnnualReportFormChanges]);

  const upcomingReportDueDate =
    projectRevision.upcomingAnnualReportFormChange?.asReportingRequirement
      .reportDueDate;

  const reportSubmittedDates = useMemo(() => {
    return projectRevision.projectAnnualReportFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.projectAnnualReportFormChanges.edges]);

  return (
    <div>
      <header>
        <h2>Annual Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator isSaved={!isUpdating && !isAdding && !isStaging} />
      </header>
      <h3>Status</h3>
      <Status
        upcomingReportDueDate={upcomingReportDueDate}
        reportSubmittedDates={reportSubmittedDates}
        reportType={"Annual"}
      />

      <ReportDueIndicator
        reportTitle="Annual Report"
        reportDueFormChange={projectRevision.upcomingAnnualReportFormChange}
      />
      <FormBorder>
        <Button
          variant="secondary"
          onClick={() =>
            addReportFormChange(
              addAnnualReportMutation,
              projectRevision,
              nextAnnualReportIndex,
              "Annual",
              projectRevision.projectAnnualReportFormChanges.__id
            )
          }
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another annual report
        </Button>

        {sortedAnnualReports.map((report, index) => {
          return (
            <div key={report.id}>
              <CollapsibleReport
                title={`Annual Report ${index + 1}`}
                reportingRequirement={report.asReportingRequirement}
              >
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteReportFormChange(
                      discardFormChange,
                      report.id,
                      report.rowId,
                      report.operation,
                      formRefs
                    )
                  }
                  className="removeButton"
                >
                  Remove
                </Button>
                <FormBase
                  id={`form-${report.id}`}
                  validateOnMount={report.changeStatus === "staged"}
                  idPrefix={`form-${report.id}`}
                  ref={(el) => (formRefs.current[report.id] = el)}
                  formData={report.newFormData}
                  onChange={(change) => {
                    updateReportFormChange(
                      applyUpdateFormChangeMutation,
                      "Annual",
                      { ...report },
                      change.formData
                    );
                  }}
                  schema={projectReportingRequirementSchema as JSONSchema7}
                  uiSchema={annualReportUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  formContext={{
                    dueDate: report.newFormData?.reportDueDate,
                  }}
                />
              </CollapsibleReport>
            </div>
          );
        })}
      </FormBorder>
      <Button
        size="medium"
        variant="primary"
        onClick={() =>
          stageReportFormChanges(
            applyStageFormChangeMutation,
            props.onSubmit,
            formRefs,
            projectRevision.projectAnnualReportFormChanges.edges,
            "Annual"
          )
        }
        disabled={isUpdating || isStaging}
      >
        Submit Annual Reports
      </Button>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div :global(button.addButton) {
          margin-bottom: 1em;
        }
        div :global(button.removeButton) {
          float: right;
        }
      `}</style>
    </div>
  );
};

export default ProjectAnnualReportForm;
