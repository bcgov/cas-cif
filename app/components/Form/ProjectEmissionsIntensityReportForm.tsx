import {
  projectEmissionIntensitySchema,
  emissionIntensityReportingRequirements,
} from "data/jsonSchemaForm/projectEmissionIntensitySchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { ProjectEmissionsIntensityReportForm_projectRevision$key } from "__generated__/ProjectEmissionsIntensityReportForm_projectRevision.graphql";

import { Button } from "@button-inc/bcgov-theme";
import { useCreateProjectEmissionIntensityFormChange } from "mutations/ProjectEmissionIntensity/addEmissionIntensityReportToRevision";
import { useUpdateEmissionIntensityReportFormChange } from "mutations/ProjectEmissionIntensity/updateEmissionIntensityReportFormChange";
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
  const schema = projectEmissionIntensitySchema;

  return schema as JSONSchema7;
};

const ProjectEmissionsIntensityReport: React.FC<Props> = (props) => {
  const projectRevision = useFragment(
    graphql`
      fragment ProjectEmissionsIntensityReportForm_projectRevision on ProjectRevision {
        id
        rowId
        reportingRequirementFormChange: formChangesFor(
          first: 1
          formDataTableName: "reporting_requirement"
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_reportingRequirementFormChange") {
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
        projectEmissionsIntensityReportFormChange: formChangesFor(
          first: 1
          formDataTableName: "emission_intensity_report"
          filter: { operation: { notEqualTo: ARCHIVE } }
        )
          @connection(
            key: "connection_projectEmissionsIntensityReportFormChange"
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
    projectRevision.projectEmissionsIntensityReportFormChange.edges[0]?.node;

  const reportingRequirementFormChange =
    projectRevision.reportingRequirementFormChange.edges[0]?.node;

  const [
    addProjectEmissionsIntensityReport,
    isAddingEmissionsIntensityReportFormChange,
  ] = useCreateProjectEmissionIntensityFormChange();
  const [
    updateEmissionsIntensityReportFormChange,
    isUpdatingEmissionsIntensityReportFormChange,
  ] = useUpdateEmissionIntensityReportFormChange();

  //const [discardProjectEmissionsIntensityReport, isDiscarding] = useDiscardProjectEmissionIntensityFormChange();

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
    props.onSubmit();
  };

  const handleError = () => {
    handleChange(emissionsIntensityReport.newFormData, "staged");
  };

  return (
    <>
      {projectRevision.projectEmissionsIntensityReportFormChange.edges
        .length === 0 && (
        <Button
          onClick={addProjectEmissionsIntensityReport({
            variables: {
              input: {
                revisionId: projectRevision.rowId,
              },
            },
          })}
          style={{ marginRight: "1rem" }}
        >
          Add TEIMP Agreement
        </Button>
      )}
      {projectRevision.projectEmissionsIntensityReportFormChange.edges.length >
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
            schema={emissionIntensityReportingRequirements as JSONSchema7}
            formData={reportingRequirementFormChange?.newFormData}
            formContext={{
              form: reportingRequirementFormChange?.newFormData,
            }}
            uiSchema={uiSchema}
            onChange={(change) => handleChange(change.formData, "pending")}
            onError={handleError}
          ></FormBase>

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
