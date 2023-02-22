import {
  projectSummaryReportSchema,
  projectSummaryReportUiSchema,
} from "data/jsonSchemaForm/projectSummaryReportSchema";
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
import SavingIndicator from "./SavingIndicator";

interface Props {
  query: any;
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
          first: 1000
        ) @connection(key: "connection_projectSummaryFormChanges") {
          __id # this file does not seem to use it directly
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              operation # this file does not seem to use it directly
              asReportingRequirement {
                reportType # this file does not seem to use it directly
              }
            }
          }
        }
        upcomingProjectSummaryReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Project Summary Report"
        ) {
          id
          ...ReportDueIndicator_formChange # this file does not seem to use it directly
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

  // TODO: handle discard

  const upcomingReportDueDate =
    projectRevision.upcomingProjectSummaryReportFormChange
      ?.asReportingRequirement.reportDueDate;

  const reportSubmittedDates = useMemo(() => {
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
      <h3>Project Summary Report</h3>
      <SavingIndicator isSaved={!isCreating && !isUpdating} />
      <Status
        upcomingReportDueDate={upcomingReportDueDate}
        reportSubmittedDates={reportSubmittedDates}
        reportType={"Project Summary"}
      />
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
        <div>
          <FormBase
            id={`form-${projectRevision.id}`}
            validateOnMount={formChangeNode.changeStatus === "staged"}
            schema={projectSummaryReportSchema as JSONSchema7}
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
              // stage reporting requirement changes is deprecated?
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
      )}
    </>
  );
};

export default ProjectSummaryReportForm;
