import { projectSummaryReportUiSchema } from "data/jsonSchemaForm/projectSummaryReportUISchema";
import { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";
import { Button } from "@button-inc/bcgov-theme";
import { ProjectSummaryReportForm_projectRevision$key } from "__generated__/ProjectSummaryReportForm_projectRevision.graphql";
import { graphql, useFragment } from "react-relay";
import { MutableRefObject, useRef } from "react";
import { useCreateProjectSummaryReport } from "mutations/ProjectSummaryReport/createProjectSummaryReport";
import { useUpdateProjectSummaryReportFormChangeMutation } from "mutations/ProjectSummaryReport/updateProjectSummaryReportFormChange";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";
import Status from "components/ReportingRequirement/Status";
import UndoChangesButton from "./UndoChangesButton";
import SavingIndicator from "./SavingIndicator";
import { ISubmitEvent } from "@rjsf/core";

interface Props {
  projectRevision: ProjectSummaryReportForm_projectRevision$key;
  onSubmit: () => void;
}

const ProjectSummaryReportForm: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectSummaryReportForm_projectRevision on ProjectRevision {
        id
        rowId
        # eslint-disable-next-line relay/unused-fields
        projectFormChange {
          formDataRecordId
        }
        projectSummaryFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Project Summary Report"
          first: 1
        ) @connection(key: "connection_projectSummaryFormChanges") {
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              formByJsonSchemaName {
                jsonSchema
              }
            }
          }
        }
        upcomingProjectSummaryReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Project Summary Report"
        ) {
          id
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...ReportDueIndicator_formChange
          asReportingRequirement {
            reportDueDate
          }
        }
      }
    `,
    props.projectRevision
  );

  // mutations
  const [createProjectSummary, isCreating] = useCreateProjectSummaryReport();

  const [updateProjectSummary, isUpdating] =
    useUpdateProjectSummaryReportFormChangeMutation();

  const [stageFormChange, isStaging] = useStageFormChange();

  const upcomingReportDueDate =
    projectRevision.upcomingProjectSummaryReportFormChange
      ?.asReportingRequirement.reportDueDate;

  const reportSubmittedDate = [
    projectRevision.projectSummaryFormChanges.edges[0]?.node.newFormData
      .submittedDate,
  ];

  const projectSummaryFormChange =
    projectRevision.projectSummaryFormChanges.edges[0]?.node;

  const handleChange = (changeData) => {
    const formData = { ...projectSummaryFormChange.newFormData, ...changeData };
    updateProjectSummary({
      variables: {
        reportType: "Project Summary Report",
        input: {
          rowId: projectSummaryFormChange.rowId,
          formChangePatch: {
            newFormData: {
              ...formData,
            },
          },
        },
      },
      debounceKey: projectSummaryFormChange.id,
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: projectSummaryFormChange.id,
            newFormData: {
              ...changeData,
            },
            changeStatus: "pending",
          },
        },
      },
    });
  };

  const handleStage = async (changeData?: any) => {
    const formData = { ...projectSummaryFormChange.newFormData, ...changeData };
    return new Promise((resolve, reject) =>
      stageFormChange({
        variables: {
          input: {
            rowId: projectSummaryFormChange.rowId,
            formChangePatch: changeData ? { newFormData: { ...formData } } : {},
          },
        },
        optimisticResponse: {
          stageFormChange: {
            formChange: {
              id: projectSummaryFormChange.id,
              changeStatus: "staged",
              newFormData: { ...changeData },
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
      })
    );
  };

  const handleSubmit = async (e: ISubmitEvent<any>) => {
    await handleStage(e.formData);
    props.onSubmit();
  };

  const handleError = () => {
    handleStage();
  };

  return (
    <>
      {projectRevision.projectSummaryFormChanges.edges.length == 0 && (
        <Button
          disabled={isCreating}
          onClick={() =>
            createProjectSummary({
              variables: {
                input: {
                  operation: "CREATE",
                  formDataSchemaName: "cif",
                  formDataTableName: "reporting_requirement",
                  jsonSchemaName: "project_summary_report",
                  newFormData: {
                    reportType: "Project Summary Report",
                    reportingRequirementIndex: 1,
                  },
                  projectRevisionId: projectRevision.rowId,
                },
              },
            })
          }
        >
          Add Project Summary Report
        </Button>
      )}
      {projectRevision.projectSummaryFormChanges.edges.length > 0 && (
        <>
          <header>
            <h3>Project Summary Report</h3>
            <UndoChangesButton
              formChangeIds={[projectSummaryFormChange.rowId]}
              formRefs={formRefs}
            />
            <SavingIndicator
              isSaved={!isUpdating && !isCreating && !isStaging}
            />
          </header>
          <Status
            upcomingReportDueDate={upcomingReportDueDate}
            reportSubmittedDates={reportSubmittedDate}
            reportType={"Project Summary"}
          />
          <FormBase
            id={`form-${projectRevision.id}`}
            ref={(el) => (formRefs.current[projectSummaryFormChange.id] = el)}
            validateOnMount={projectSummaryFormChange.changeStatus === "staged"}
            schema={
              projectSummaryFormChange.formByJsonSchemaName.jsonSchema
                .schema as JSONSchema7
            }
            uiSchema={projectSummaryReportUiSchema}
            onChange={(change) => handleChange(change.formData)}
            onSubmit={handleSubmit}
            onError={handleError}
            formData={projectSummaryFormChange.newFormData}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
          >
            <Button
              size="medium"
              variant="primary"
              type="submit"
              disabled={isUpdating || isStaging}
            >
              Submit Project Summary
            </Button>
          </FormBase>
        </>
      )}
    </>
  );
};

export default ProjectSummaryReportForm;
