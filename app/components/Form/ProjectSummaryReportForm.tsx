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

  // TODO: handle discard???

  const upcomingReportDueDate =
    projectRevision.upcomingProjectSummaryReportFormChange
      ?.asReportingRequirement.reportDueDate;

  const reportSubmittedDate = useMemo(() => {
    return projectRevision.projectSummaryFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.projectSummaryFormChanges.edges]);

  const formChangeNode =
    projectRevision.projectSummaryFormChanges.edges[0]?.node;

  interface PartialProjectSummaryFormData {
    [key: string]: any;
  }

  const handleChange = (changeData: PartialProjectSummaryFormData) => {
    const formData = { ...formChangeNode.newFormData, ...changeData };

    updateProjectSummary({
      variables: {
        reportType: "Project Summary Report",
        input: {
          rowId: formChangeNode.rowId,
          formChangePatch: {
            newFormData: {
              ...formData,
            },
          },
        },
      },
      debounceKey: formChangeNode.id,
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChangeNode.id,
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
          variant="secondary"
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
          Create
        </Button>
      )}
      {projectRevision.projectSummaryFormChanges.edges.length > 0 && (
        <>
          <header>
            <h3>Project Summary Report</h3>
            <Status
              upcomingReportDueDate={upcomingReportDueDate}
              reportSubmittedDates={reportSubmittedDate}
              reportType={"Project Summary Report"}
            />
          </header>
          <div>
            <FormBase
              id={`form-${projectRevision.id}`}
              validateOnMount={formChangeNode.changeStatus === "staged"}
              schema={
                formChangeNode.formByJsonSchemaName.jsonSchema
                  .schema as JSONSchema7
              }
              uiSchema={projectSummaryReportUiSchema}
              onChange={(change) => handleChange(change.formData)}
              ref={(el) => (formRefs.current[formChangeNode.id] = el)}
              formData={formChangeNode.newFormData}
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
          </div>
        </>
      )}
    </>
  );
};

export default ProjectSummaryReportForm;
