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
import { MutableRefObject, useRef } from "react";
import { stageReportFormChanges } from "./Functions/reportingRequirementFormChangeFunctions";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
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

const ProjectEmissionsIntensityReport: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

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
        projectEmissionIntensityReportFormChange: formChangesFor(
          first: 1
          formDataTableName: "emission_intensity_report"
          filter: { operation: { notEqualTo: ARCHIVE } }
        )
          @connection(
            key: "connection_projectEmissionIntensityReportFormChange"
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

  const emissionIntensityReportFormChange =
    projectRevision.projectEmissionIntensityReportFormChange.edges[0]?.node;

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
  const [updateFormChange, isUpdatingFormChange] = useUpdateFormChange();

  //const [discardProjectEmissionsIntensityReport, isDiscarding] = useDiscardProjectEmissionIntensityFormChange();

  const handleChange = (formData, changeStatus: "staged" | "pending") => {
    // don't trigger a change if the form data is an empty object
    if (formData && Object.keys(formData).length === 0) return;
    if (emissionIntensityReportFormChange) {
      const updatedFormData = {
        ...emissionIntensityReportFormChange.newFormData,
        ...formData,
      };
      updateEmissionsIntensityReportFormChange({
        variables: {
          input: {
            id: emissionIntensityReportFormChange.id,
            formChangePatch: {
              newFormData: updatedFormData,
              changeStatus: changeStatus,
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: emissionIntensityReportFormChange.id,
              newFormData: updatedFormData,
              changeStatus: changeStatus,
            },
          },
        },
        debounceKey: emissionIntensityReportFormChange.id,
      });
    }
  };

  const handleSubmit = async ({ formData }) => {
    handleChange(formData, "staged");
    props.onSubmit();
  };

  const handleError = () => {
    handleChange(emissionIntensityReportFormChange.newFormData, "staged");
  };

  console.warn(projectRevision.projectEmissionIntensityReportFormChange);
  return null;

  return (
    <>
      {projectRevision.projectEmissionIntensityReportFormChange.edges.length ===
        0 && (
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
      {projectRevision.projectEmissionIntensityReportFormChange.edges.length >
        0 && (
        <>
          <header>
            <h3>Emission Intensity Report</h3>
            <UndoChangesButton
              formChangeIds={[emissionIntensityReportFormChange?.rowId]}
            />
            <SavingIndicator
              isSaved={
                !isUpdatingEmissionsIntensityReportFormChange &&
                !isAddingEmissionsIntensityReportFormChange
              }
            />
          </header>
          <FormBase
            id="TEIMP_ReportingRequirementForm"
            ref={(el) =>
              (formRefs.current[reportingRequirementFormChange.id] = el)
            }
            validateOnMount={
              reportingRequirementFormChange?.changeStatus === "staged"
            }
            idPrefix="TEIMP_ReportingRequirementForm"
            schema={emissionIntensityReportingRequirements as JSONSchema7}
            formData={reportingRequirementFormChange?.newFormData}
            formContext={{
              form: reportingRequirementFormChange?.newFormData,
            }}
            uiSchema={uiSchema}
            onChange={(change) => handleChange(change.formData, "pending")}
            onError={handleError}
          />
          <FormBase
            id="TEIMP_EmissionIntensityReportForm"
            validateOnMount={
              emissionIntensityReportFormChange?.changeStatus === "staged"
            }
            idPrefix="TEIMP_EmissionIntensityReportForm"
            schema={projectEmissionIntensitySchema as JSONSchema7}
            formData={emissionIntensityReportFormChange?.newFormData}
            formContext={{
              form: emissionIntensityReportFormChange?.newFormData,
            }}
            uiSchema={uiSchema}
            onChange={(change) => handleChange(change.formData, "pending")}
            onSubmit={handleSubmit}
            onError={handleError}
          />
          <Button
            size="medium"
            variant="primary"
            onClick={() =>
              stageReportFormChanges(
                updateEmissionsIntensityReportFormChange,
                props.onSubmit,
                formRefs,
                [
                  ...projectRevision.reportingRequirementFormChange.edges,
                  ...projectRevision.projectEmissionIntensityReportFormChange
                    .edges,
                ],
                "TEIMP",
                updateFormChange
              )
            }
            disabled={
              isAddingEmissionsIntensityReportFormChange ||
              isUpdatingEmissionsIntensityReportFormChange ||
              isUpdatingFormChange
            }
          >
            Submit Milestone Reports
          </Button>
        </>
      )}
    </>
  );
};

export default ProjectEmissionsIntensityReport;
