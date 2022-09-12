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
import { ProjectMilestoneReportFormGroup_projectRevision$key } from "__generated__/ProjectMilestoneReportFormGroup_projectRevision.graphql";
import { ProjectMilestoneReportFormGroup_query$key } from "__generated__/ProjectMilestoneReportFormGroup_query.graphql";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
import milestoneUiSchema from "data/jsonSchemaForm/projectMilestoneUiSchema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import FormBase from "./FormBase";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { useCreateMilestone } from "mutations/MilestoneReport/createMilestone";
import stageMultipleReportingRequirementFormChanges from "./Functions/stageMultipleReportingRequirementFormChanges";
import { useStageReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/stageReportingRequirementFormChange";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectMilestoneReportFormGroup_projectRevision$key;
  query: ProjectMilestoneReportFormGroup_query$key;
}

const ProjectMilestoneReportFormGroup: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectMilestoneReportFormGroup_projectRevision on ProjectRevision {
        id
        rowId
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
              asReportingRequirement {
                reportType
                ...CollapsibleReport_reportingRequirement
              }
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
      fragment ProjectMilestoneReportFormGroup_query on Query {
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

  return (
    <div>
      <header id={`Milestone0`}>
        <h2>Milestone Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator isSaved={!isCreating && !isUpdating} />
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
                    reportingRequirementIndex:
                      projectRevision.milestoneFormChanges.edges.length + 1,
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

        {projectRevision.milestoneFormChanges.edges.map(({ node }, index) => {
          return (
            <div key={node.id} id={`Milestone${index + 1}`}>
              <CollapsibleReport
                title={`Milestone ${index + 1}`}
                reportingRequirement={node.asReportingRequirement}
              >
                <FormBase
                  id={`form-${node.id}`}
                  validateOnMount={node.changeStatus === "staged"}
                  idPrefix={`form-${node.id}`}
                  ref={(el) => (formRefs.current[node.id] = el)}
                  formData={node.newFormData}
                  onChange={(change) =>
                    updateMilestone({
                      variables: {
                        reportType: "Milestone",
                        input: {
                          rowId: node.rowId,
                          formChangePatch: {
                            newFormData: {
                              ...node.newFormData,
                              ...change.formData,
                              hasExpenses: true, // how to calculate this efficiently? Custom Widget to set both values?
                            },
                          },
                        },
                      },
                      debounceKey: node.id,
                      optimisticResponse: {
                        updateFormChange: {
                          formChange: {
                            id: node.id,
                            newFormData: change.formData,
                            changeStatus: "pending",
                          },
                        },
                      },
                    })
                  }
                  schema={schema as JSONSchema7}
                  uiSchema={milestoneUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  formContext={{
                    dueDate: node.newFormData?.reportDueDate,
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
        disabled={isUpdating || isStagingReportingRequirement}
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

export default ProjectMilestoneReportFormGroup;
