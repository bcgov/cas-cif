import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import FormBorder from "lib/theme/components/FormBorder";
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
import addDurationToTimestamptz from "lib/helpers/addDurationToTimestamptz";
import subtractDurationFromTimestamptz from "lib/helpers/subtractDurationFromTimestamptz";
import { useUpdateMilestone } from "mutations/MilestoneReport/updateMilestone";

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
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                name
              }
            }
          }
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
            }
          }
        }
        upcomingMilestoneReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Milestone"
        ) {
          id
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

  const fundingStream =
    projectRevision.projectFormChange.asProject
      .fundingStreamRfpByFundingStreamRfpId.fundingStreamByFundingStreamId.name;

  const isFundingStreamEP = fundingStream === "EP";

  const schema = JSON.parse(JSON.stringify(query.formBySlug.jsonSchema.schema));
  // Opportunity for a refactor here to populate the anyOf array on the server with a computed column
  schema.properties.reportType = {
    ...schema.properties.reportType,
    anyOf: query.allReportTypes.edges
      .filter(
        ({ node }) =>
          !(isFundingStreamEP && node.name === "Interim Summary Report")
      )
      .map(({ node }) => {
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
  const [updateMilestone, isUpdating] = useUpdateMilestone();
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

  const upcomingReportFormChange =
    projectRevision.upcomingMilestoneReportFormChange;

  const indexOfNextMilestone =
    sortedMilestoneReports.findIndex(
      (x) => x.id === upcomingReportFormChange?.id
    ) + 1;

  const reportSubmittedDates = useMemo(() => {
    return projectRevision.milestoneFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.milestoneFormChanges.edges]);

  interface PartialMilestoneFormData {
    substantialCompletionDate?: string;
    [key: string]: any;
  }

  const handleChange = (
    milestoneChangeData: PartialMilestoneFormData,
    milestoneNode: {
      rowId: number;
      id: string;
      newFormData: PartialMilestoneFormData;
    }
  ) => {
    const formData = { ...milestoneNode.newFormData, ...milestoneChangeData };
    if (
      milestoneChangeData.substantialCompletionDate &&
      milestoneChangeData.substantialCompletionDate !=
        milestoneNode.newFormData.substantialCompletionDate
    ) {
      formData.reportDueDate = addDurationToTimestamptz(
        milestoneChangeData.substantialCompletionDate,
        { days: 30 }
      );
    } else if (
      milestoneChangeData.reportDueDate &&
      milestoneChangeData.reportDueDate !=
        milestoneNode.newFormData.reportDueDate
    ) {
      formData.substantialCompletionDate = subtractDurationFromTimestamptz(
        milestoneChangeData.reportDueDate,
        { days: 30 }
      );
    }
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
              hasExpenses: reportTypeRecord?.node.hasExpenses,
            },
          },
        },
      },
      debounceKey: milestoneNode.id,
      optimisticResponse: {
        updateMilestoneFormChange: {
          formChange: {
            id: milestoneNode.id,
            newFormData: {
              ...milestoneChangeData,
              hasExpenses: reportTypeRecord?.node.hasExpenses,
            },
            changeStatus: "pending",
          },
        },
      },
    });
  };

  milestoneUiSchema.substantialCompletionDate["ui:help"] = (
    <small>
      Entering this field automatically calculates Report Due Date (and vice
      versa)
    </small>
  );

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
        renderingIndex={indexOfNextMilestone}
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
          <FontAwesomeIcon icon={faPlusCircle} /> Add Another Milestone Report
        </Button>
        {sortedMilestoneReports.map((node, index) => {
          const formData = { ...node.newFormData };
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
                  ref={(el) => el && (formRefs.current[node.id] = el)}
                  formData={formData}
                  onChange={(change) => handleChange(change.formData, node)}
                  schema={schema as JSONSchema7}
                  uiSchema={milestoneUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  formContext={{
                    dueDate: formData?.reportDueDate,
                    // retrieving calculated amounts from newFormData rather than using the calculated fields directly to avoid discrepencies between front-end and payments table
                    calculatedGrossAmount:
                      node.newFormData.calculatedGrossAmount,
                    calculatedHoldbackAmount:
                      node.newFormData.calculatedHoldbackAmount,
                    calculatedNetAmount: node.newFormData.calculatedNetAmount,
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
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default ProjectMilestoneReportForm;
