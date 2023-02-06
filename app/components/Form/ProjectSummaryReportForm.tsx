import {
  projectSummaryReportSchema,
  projectSummaryReportUiSchema,
} from "data/jsonSchemaForm/projectSummaryReportSchema";
import { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";
import { Button } from "@button-inc/bcgov-theme";
import { ProjectSummaryReportForm_projectRevision$key } from "__generated__/ProjectSummaryReportForm_projectRevision.graphql";
import { graphql, useFragment } from "react-relay";
import { MutableRefObject, useRef } from "react";
import { useCreateProjectSummaryReport } from "mutations/ProjectSummaryReport/createProjectSummaryReport";
import { useUpdateProjectSummaryReportFormChangeMutation } from "mutations/ProjectSummaryReport/updateProjectSummaryReportFormChange";

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
        projectFormChange {
          formDataRecordId
        }
        projectSummaryFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Project Summary Report"
          first: 1000
        ) @connection(key: "connection_projectSummaryFormChanges") {
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
              }
            }
          }
        }
        upcomingProjectSummaryReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Project Summary Report"
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

  // mutations
  // const [createMilestone, isCreating] = useCreateMilestone();
  const [updateProjectSummary, isUpdating] =
    useUpdateProjectSummaryReportFormChangeMutation();
  // create project summary report form on project revision if not created

  // update project summary report with new data on change

  // apply changes on submit

  // no requirement for undo

  const report = projectRevision.projectSummaryFormChanges.edges[0]?.node;

  console.log("projectRevision: ", projectRevision);

  const handleChange = (changeData: any) => {
    console.log("handle change");
    console.log(changeData);

    updateProjectSummary({
      variables: {
        reportType: "Project Summary Report",
        input: {
          rowId: changeData.rowId,
          formChangePatch: {
            newFormData: {
              ...report.newFormData,
            },
          },
        },
      },
      debounceKey: changeData.id,
    });
  };

  return (
    <>
      <h3>Project Summary Report Form Placeholder</h3>
      <FormBase
        id={`form-${projectRevision.id}`}
        // validateOnMount={projectRevision.projectFormChange[0].node.changeStatus === "staged"}
        schema={projectSummaryReportSchema as JSONSchema7}
        uiSchema={projectSummaryReportUiSchema}
        onChange={(change) => handleChange(change.formData)}
        // ref={(el) => (formRefs.current[report.id] = el)}
        // formData={report.newFormData}
        // ObjectFieldTemplate={EmptyObjectFieldTemplate}
        // formContext={{
        //   dueDate: report.newFormData?.reportDueDate,
        // }}
      >
        <Button type="submit" style={{ marginRight: "1rem" }}>
          Submit Project Summary
        </Button>
      </FormBase>
    </>
  );
};

export default ProjectSummaryReportForm;
