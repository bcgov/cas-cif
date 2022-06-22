import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import {
  milestoneReportUiSchema,
  projectMilestoneSchema,
} from "data/jsonSchemaForm/projectMilestoneSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { getReportingStatus, isOverdue } from "lib/helpers/reportStatusHelpers";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision";
import useDiscardReportingRequirementFormChange from "mutations/ProjectReportingRequirement/discardReportingRequirementFormChange";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useRouter } from "next/router";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectMilestoneReportForm_projectRevision$key } from "__generated__/ProjectMilestoneReportForm_projectRevision.graphql";
import { ProjectMilestoneReportForm_query$key } from "__generated__/ProjectMilestoneReportForm_query.graphql";
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
  projectRevision: ProjectMilestoneReportForm_projectRevision$key;
  query: ProjectMilestoneReportForm_query$key;
}

export const createProjectMilestoneSchema = (allReportTypes) => {
  const schema = projectMilestoneSchema;
  schema.properties.reportType = {
    ...schema.properties.reportType,
    anyOf: allReportTypes.edges.map(({ node }) => {
      const replaceRegex = /\sMilestone/i;
      const displayValue = node.name.replace(replaceRegex, "");
      return {
        type: "string",
        title: displayValue,
        enum: [node.name],
        value: node.name,
      } as JSONSchema7Definition;
    }),
    default: "General Milestone",
  };
  schema.properties.certifiedByProfessionalDesignation = {
    ...schema.properties.certifiedByProfessionalDesignation,
    anyOf: ["Professional Engineer", "Certified Professional Accountant"].map(
      (designation) => {
        return {
          type: "string",
          title: designation,
          enum: [designation],
          value: designation,
        } as JSONSchema7Definition;
      }
    ),
  };

  return schema as JSONSchema7;
};

const ProjectMilestoneReportForm: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});
  const router = useRouter();

  const projectRevision = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_projectRevision on ProjectRevision {
        id
        # eslint-disable-next-line relay/unused-fields
        rowId
        projectMilestoneReportFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        ) @connection(key: "connection_projectMilestoneReportFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              operation
              changeStatus
              # eslint-disable-next-line relay/unused-fields
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
        upcomingMilestoneReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Milestone"
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

  const query = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_query on Query {
        allReportTypes(filter: { name: { notIn: ["Quarterly", "Annual"] } }) {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
    props.query
  );

  useEffect(() => {
    if (router.query.anchor !== "Milestone0")
      router.push(`#${router.query.anchor}`);
    // TODO: refactor useEffect. In the meantime, ignore the eslint warning--fixing it causes infinite rerender.
  }, [router.query.anchor]);

  const milestoneSchema = useMemo(() => {
    return createProjectMilestoneSchema(query.allReportTypes);
  }, [query.allReportTypes]);

  const [addMilestoneReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const [discardFormChange] = useDiscardReportingRequirementFormChange(
    "Milestone",
    projectRevision.projectMilestoneReportFormChanges.__id
  );

  const [sortedMilestoneReports, nextMilestoneReportIndex] = useMemo(() => {
    return getSortedReports(
      projectRevision.projectMilestoneReportFormChanges.edges
    );
  }, [projectRevision.projectMilestoneReportFormChanges]);

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.projectMilestoneReportFormChanges.edges.map(
      ({ node }) => node?.rowId
    );
  }, [projectRevision.projectMilestoneReportFormChanges]);

  const reportDueDate =
    projectRevision.upcomingMilestoneReportFormChange?.asReportingRequirement
      .reportDueDate;
  const overdue = useMemo(() => {
    return isOverdue(reportDueDate);
  }, [reportDueDate]);

  const reportSubmittedDates = useMemo(() => {
    return projectRevision.projectMilestoneReportFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.projectMilestoneReportFormChanges.edges]);

  const variant = getReportingStatus(reportSubmittedDates, overdue);

  return (
    <div>
      <header id={`Milestone0`}>
        <h2>Milestone Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>
      <Status variant={variant} reportType={"Milestone"} />
      <ReportDueIndicator
        reportTitle="Milestone Report"
        reportDueFormChange={projectRevision.upcomingMilestoneReportFormChange}
      />
      <FormBorder>
        <Button
          variant="secondary"
          onClick={() =>
            addReportFormChange(
              addMilestoneReportMutation,
              projectRevision,
              nextMilestoneReportIndex,
              "General Milestone",
              projectRevision.projectMilestoneReportFormChanges.__id
            )
          }
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another milestone report
        </Button>

        {sortedMilestoneReports.map((milestoneReport, index) => {
          return (
            <div key={milestoneReport.id}>
              <CollapsibleReport
                title={`Milestone ${index + 1}`}
                reportingRequirement={milestoneReport.asReportingRequirement}
              >
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteReportFormChange(
                      discardFormChange,
                      milestoneReport.id,
                      milestoneReport.operation,
                      formRefs
                    )
                  }
                  className="removeButton"
                >
                  Remove
                </Button>
                <FormBase
                  id={`form-${milestoneReport.id}`}
                  validateOnMount={milestoneReport.changeStatus === "staged"}
                  idPrefix={`form-${milestoneReport.id}`}
                  ref={(el) => (formRefs.current[milestoneReport.id] = el)}
                  formData={milestoneReport.newFormData}
                  onChange={(change) => {
                    updateReportFormChange(
                      applyUpdateFormChangeMutation,
                      "Milestone",
                      { ...milestoneReport, changeStatus: "pending" },
                      change.formData
                    );
                  }}
                  schema={milestoneSchema as JSONSchema7}
                  uiSchema={milestoneReportUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  formContext={{
                    dueDate: milestoneReport.newFormData?.reportDueDate,
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
            applyUpdateFormChangeMutation,
            "General Milestone",
            props.onSubmit,
            formRefs,
            projectRevision.projectMilestoneReportFormChanges.edges
          )
        }
        disabled={isUpdating}
      >
        Submit Milestone Reports
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

export default ProjectMilestoneReportForm;
