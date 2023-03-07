import { projectSummaryReportUiSchema } from "data/jsonSchemaForm/projectSummaryReportUISchema";
import { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";
import { Button } from "@button-inc/bcgov-theme";
import { ProjectSummaryReportForm_projectRevision$key } from "__generated__/ProjectSummaryReportForm_projectRevision.graphql";
import { graphql, useFragment } from "react-relay";
import { MutableRefObject, useRef, useMemo } from "react";
import { useCreateProjectSummaryReport } from "mutations/ProjectSummaryReport/createProjectSummaryReport";
import { useUpdateProjectSummaryReportFormChangeMutation } from "mutations/ProjectSummaryReport/updateProjectSummaryReportFormChange";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useStageReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/stageReportingRequirementFormChange";
import stageMultipleReportingRequirementFormChanges from "./Functions/stageMultipleReportingRequirementFormChanges";
import Status from "components/ReportingRequirement/Status";
// import UndoChangesButton from "./UndoChangesButton";
// import SavingIndicator from "./SavingIndicator";

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

  const [
    applyStageReportingRequirementFormChange,
    isStagingReportingRequirement,
  ] = useStageReportingRequirementFormChange();

  const upcomingReportDueDate =
    projectRevision.upcomingProjectSummaryReportFormChange
      ?.asReportingRequirement.reportDueDate;

  const reportSubmittedDates = useMemo(() => {
    return projectRevision.projectSummaryFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.projectSummaryFormChanges.edges]);

  const projectSummaryFormChange =
    projectRevision.projectSummaryFormChanges.edges[0]?.node;

  interface PartialProjectSummaryFormData {
    [key: string]: any;
  }

  const handleChange = (changeData: PartialProjectSummaryFormData) => {
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
            {/* <UndoChangesButton
              formChangeIds={[
                projectSummaryFormChange.rowId,
              ]}
              formRefs={formRefs}
            />
            <SavingIndicator
              isSaved={
                !isUpdating &&
                !isCreating
              }
            /> */}
          </header>
          <Status
            upcomingReportDueDate={upcomingReportDueDate}
            reportSubmittedDates={reportSubmittedDates}
            reportType={"Project Summary Report"}
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
            formData={projectSummaryFormChange.newFormData}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
          />
          <Button
            size="medium"
            variant="primary"
            onClick={() =>
              stageMultipleReportingRequirementFormChanges(
                applyStageReportingRequirementFormChange,
                props.onSubmit,
                formRefs,
                projectRevision.projectSummaryFormChanges.edges,
                "Project Summary Report"
              )
            }
            disabled={isUpdating || isStagingReportingRequirement}
          >
            Submit Project Summary
          </Button>
        </>
      )}
    </>
  );
};

export default ProjectSummaryReportForm;
