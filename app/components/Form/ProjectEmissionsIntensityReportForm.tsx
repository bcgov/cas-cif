import projectEmissionsIntensitySchema from "data/jsonSchemaForm/projectEmissionsIntensitySchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { ProjectEmissionsIntensityReportForm_projectRevision$key } from "__generated__/ProjectEmissionsIntensityReportForm_projectRevision.graphql";
import { Button } from "@button-inc/bcgov-theme";
import { useCreateProjectEmissionIntensityFormChange } from "mutations/ProjectEmissionIntensity/createProjectEmissionIntensityFormChange";
import { useUpdateProjectEmissionIntensityFormChange } from "mutations/ProjectEmissionIntensity/updateProjectEmissionIntensityFormChange";
import UndoChangesButton from "./UndoChangesButton";
import SavingIndicator from "./SavingIndicator";
interface Props {
  projectRevision: ProjectEmissionsIntensityReportForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

const uiSchema = {
  startDate: {
    "ui:widget": "DateWidget",
  },
  endDate: {
    "ui:widget": "DateWidget",
  },
  reportDueDate: {
    "ui:widget": "DateWidget",
  },
  reportReceivedDate: {
    "ui:widget": "DateWidget",
  },
};

// Setting default values for some fields
const createProjectEmissionsIntensityFormSchema = () => {
  const schema = projectEmissionsIntensitySchema;

  return schema as JSONSchema7;
};

const ProjectEmissionsIntensityReport: React.FC<Props> = (props) => {
  // Mutations
  const [
    createEmissionsIntensityReportFormChange,
    isAddingEmissionsIntensityReportFormChange,
  ] = useCreateProjectEmissionIntensityFormChange();
  const [
    updateEmissionsIntensityReportFormChange,
    isUpdatingEmissionsIntensityReportFormChange,
  ] = useUpdateProjectEmissionIntensityFormChange();

  const projectRevision = useFragment(
    graphql`
      fragment ProjectEmissionsIntensityReportForm_projectRevision on ProjectRevision {
        id
        rowId
        projectFormChange {
          formDataRecordId
        }
        projectEmissionsIntensityReportFormChanges: formChangesFor(
          first: 500
          formDataTableName: "emission_intensity_report"
          filter: { operation: { notEqualTo: ARCHIVE } }
        )
          @connection(
            key: "connection_projectEmissionsIntensityReportFormChanges"
          ) {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const emissionsIntensityReport =
    projectRevision.projectEmissionsIntensityReportFormChanges.edges[0]?.node;

  const addProjectEmissionsIntensityReport = () => {
    createEmissionsIntensityReportFormChange({
      variables: {
        input: {
          projectRevisionId: projectRevision.rowId,
          formDataSchemaName: "cif",
          formDataTableName: "emission_intensity_report",
          jsonSchemaName: "emission_intensity_report", 
          operation: "CREATE",
          newFormData: {
            projectId: projectRevision.projectFormChange.formDataRecordId,
          },
        },
        connections: [
          projectRevision.projectEmissionsIntensityReportFormChanges.__id,
        ],
      },
    });
  };

  const handleChange = (formData, changeStatus: "staged" | "pending") => {
    // don't trigger a change if the form data is an empty object
    if (formData && Object.keys(formData).length === 0) return;

    if (emissionsIntensityReport) {
      const updatedFormData = {
        ...emissionsIntensityReport.newFormData,
        ...formData,
      };
      updateEmissionsIntensityReportFormChange({
        variables: {
          input: {
            id: emissionsIntensityReport.id,
            formChangePatch: {
              newFormData: updatedFormData,
              changeStatus: changeStatus,
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: emissionsIntensityReport.id,
              newFormData: updatedFormData,
              changeStatus: changeStatus,
            },
          },
        },
        debounceKey: emissionsIntensityReport.id,
      });
    }
  };

  const handleSubmit = async ({ formData }) => {
    handleChange(formData, "staged");
    console.log("GURJ: handling subm");
    props.onSubmit();
  };

  const handleError = () => {
    handleChange(emissionsIntensityReport.newFormData, "staged");
  };

  console.log("GURJ: ", projectRevision);
  return (
    <>
      {projectRevision.projectEmissionsIntensityReportFormChanges.edges
        .length === 0 && (
        <Button
          onClick={addProjectEmissionsIntensityReport}
          style={{ marginRight: "1rem" }}
        >
          Add TEIMP Agreement
        </Button>
      )}
      {projectRevision.projectEmissionsIntensityReportFormChanges.edges.length >
        0 && (
        <>
          <header>
            <h3>Emission Intensity Report</h3>
            <UndoChangesButton
              formChangeIds={[emissionsIntensityReport?.rowId]}
            />
            <SavingIndicator
              isSaved={
                !isUpdatingEmissionsIntensityReportFormChange &&
                !isAddingEmissionsIntensityReportFormChange
              }
            />
          </header>

          <FormBase
            id="ProjectEmissionsIntensityReportForm"
            validateOnMount={
              emissionsIntensityReport?.changeStatus === "staged"
            }
            idPrefix="ProjectEmissionsIntensityReportForm"
            schema={createProjectEmissionsIntensityFormSchema() as JSONSchema7}
            formData={emissionsIntensityReport?.newFormData}
            formContext={{
              form: emissionsIntensityReport?.newFormData,
            }}
            uiSchema={uiSchema}
            onChange={(change) => handleChange(change.formData, "pending")}
            onSubmit={handleSubmit}
            onError={handleError}
          >
            <Button
              type="submit"
              style={{ marginRight: "1rem" }}
              disabled={
                isUpdatingEmissionsIntensityReportFormChange ||
                isAddingEmissionsIntensityReportFormChange
              }
            >
              Submit Project Emissions Intensity Report
            </Button>
          </FormBase>
        </>
      )}
    </>
  );
};

export default ProjectEmissionsIntensityReport;
