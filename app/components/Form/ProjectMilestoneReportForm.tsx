import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import FormBorder from "lib/theme/components/FormBorder";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { MutableRefObject, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";

import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
import milestoneUiSchema from "data/jsonSchemaForm/projectMilestoneUiSchema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import FormBase from "./FormBase";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { useCreateMilestone } from "mutations/MilestoneReport/createMilestone";
import stageMultipleReportingRequirementFormChanges from "./Functions/stageMultipleReportingRequirementFormChanges";
import { useStageReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/stageReportingRequirementFormChange";
import useDiscardReportingRequirementFormChange from "mutations/ProjectReportingRequirement/discardReportingRequirementFormChange";
import {
  deleteReportFormChange,
  getSortedReports,
} from "./Functions/reportingRequirementFormChangeFunctions";
import { ProjectMilestoneReportForm_projectRevision$key } from "__generated__/ProjectMilestoneReportForm_projectRevision.graphql";
import { ProjectMilestoneReportForm_query$key } from "__generated__/ProjectMilestoneReportForm_query.graphql";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectMilestoneReportForm_projectRevision$key;
  query: ProjectMilestoneReportForm_query$key;
}

const ProjectMilestoneReportForm: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_projectRevision on ProjectRevision {
        id
        rowId
        # eslint-disable-next-line relay/unused-fields
        projectFormChange {
          formDataRecordId
        }
        milestoneFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        ) @connection(key: "connection_milestoneFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              operation
              asReportingRequirement {
                reportType
                ...CollapsibleReport_reportingRequirement
              }
              calculatedGrossAmountThisMilestone
              calculatedNetAmountThisMilestone
              calculatedHoldbackAmountThisMilestone
            }
          }
        }
        upcomingMilestoneReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Milestone"
        ) {
          ...ReportDueIndicator_formChange
          asReportingRequirement {
            reportDueDate
          }
        }
      }
    `,
    props.projectRevision
  );

  const query = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_query on Query {
        allReportTypes(filter: { isMilestone: { equalTo: true } }) {
          edges {
            node {
              name
              hasExpenses
            }
          }
        }
        formBySlug(slug: "milestone") {
          jsonSchema
        }
      }
    `,
    props.query
  );

  const schema = JSON.parse(JSON.stringify(query.formBySlug.jsonSchema.schema));

  // Opportunity for a refactor here to populate the anyOf array on the server with a computed column
  schema.properties.reportType = {
    ...schema.properties.reportType,
    anyOf: query.allReportTypes.edges.map(({ node }) => {
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

  const [createMilestone, isCreating] = useCreateMilestone();
  const [updateMilestone, isUpdating] =
    useUpdateReportingRequirementFormChange();
  const [
    applyStageReportingRequirementFormChange,
    isStagingReportingRequirement,
  ] = useStageReportingRequirementFormChange();
  const [discardFormChange, isDiscarding] =
    useDiscardReportingRequirementFormChange(
      "Milestone",
      projectRevision.milestoneFormChanges.__id
    );

  const [sortedMilestoneReports, nextMilestoneReportIndex] = useMemo(() => {
    return getSortedReports(projectRevision.milestoneFormChanges.edges);
  }, [projectRevision.milestoneFormChanges]);

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return [
      ...projectRevision.milestoneFormChanges.edges.map(
        ({ node }) => node?.rowId
      ),
    ];
  }, [projectRevision.milestoneFormChanges.edges]);

  const upcomingReportDueDate =
    projectRevision.upcomingMilestoneReportFormChange?.asReportingRequirement
      .reportDueDate;

  const reportSubmittedDates = useMemo(() => {
    return projectRevision.milestoneFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.milestoneFormChanges.edges]);

  const handleChange = (
    milestoneChangeData: { newFormData: any },
    milestoneNode: { rowId: number; id: string; newFormData: any }
  ) => {
    const formData = { ...milestoneNode.newFormData, ...milestoneChangeData };
    const reportTypeRecord = query.allReportTypes.edges.find(
      ({ node }) => node.name === formData.reportType
    );
    updateMilestone({
      variables: {
        reportType: "Milestone",
        input: {
          rowId: milestoneNode.rowId,
          formChangePatch: {
            newFormData: {
              ...formData,
              hasExpenses: reportTypeRecord.node.hasExpenses,
            },
          },
        },
      },
      debounceKey: milestoneNode.id,
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: milestoneNode.id,
            newFormData: {
              ...milestoneChangeData,
              hasExpenses: reportTypeRecord.node.hasExpenses,
            },
            changeStatus: "pending",
          },
        },
      },
    });
  };

  return (
    <div>
      <header id={`Milestone0`}>
        <h2>Milestone Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator
          isSaved={!isCreating && !isUpdating && !isDiscarding}
        />
      </header>
      <Status
        upcomingReportDueDate={upcomingReportDueDate}
        reportSubmittedDates={reportSubmittedDates}
        reportType={"Milestone"}
      />
      <ReportDueIndicator
        reportTitle="Milestone Report"
        reportDueFormChange={projectRevision.upcomingMilestoneReportFormChange}
      />
      <FormBorder>
        <Button
          variant="secondary"
          disabled={isCreating}
          onClick={() =>
            createMilestone({
              variables: {
                input: {
                  operation: "CREATE",
                  formDataSchemaName: "cif",
                  formDataTableName: "reporting_requirement",
                  jsonSchemaName: "milestone",
                  newFormData: {
                    reportType: "General Milestone",
                    reportingRequirementIndex: nextMilestoneReportIndex,
                  },
                  projectRevisionId: projectRevision.rowId,
                },
              },
            })
          }
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another milestone report
        </Button>
        {sortedMilestoneReports.map((node, index) => {
          const localFormData = JSON.parse(JSON.stringify(node.newFormData));
          localFormData.calculatedGrossAmount = Number(
            node.calculatedGrossAmountThisMilestone
          );
          localFormData.calculatedHoldbackAmount = Number(
            node.calculatedNetAmountThisMilestone
          );
          localFormData.calculatedNetAmount = Number(
            node.calculatedHoldbackAmountThisMilestone
          );
          return (
            <div key={node.id} id={`Milestone${index + 1}`}>
              <CollapsibleReport
                title={`Milestone ${index + 1}`}
                reportingRequirement={node.asReportingRequirement}
              >
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteReportFormChange(
                      discardFormChange,
                      node.id,
                      node.rowId,
                      node.operation,
                      formRefs
                    )
                  }
                  className="removeButton"
                >
                  Remove
                </Button>
                <FormBase
                  id={`form-${node.id}`}
                  validateOnMount={node.changeStatus === "staged"}
                  idPrefix={`form-${node.id}`}
                  ref={(el) => (formRefs.current[node.id] = el)}
                  formData={localFormData}
                  onChange={(change) => handleChange(change.formData, node)}
                  schema={schema as JSONSchema7}
                  uiSchema={milestoneUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  formContext={{
                    dueDate: localFormData?.reportDueDate,
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
          stageMultipleReportingRequirementFormChanges(
            applyStageReportingRequirementFormChange,
            props.onSubmit,
            formRefs,
            projectRevision.milestoneFormChanges.edges,
            "Milestone"
          )
        }
        disabled={isUpdating || isStagingReportingRequirement || isDiscarding}
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
