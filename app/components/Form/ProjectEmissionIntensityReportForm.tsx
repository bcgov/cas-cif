import {
  emissionIntensityReportSchema,
  emissionIntensityReportingRequirementSchema,
  emissionIntensityReportUiSchema,
  emissionIntensityReportingRequirementUiSchema,
} from "data/jsonSchemaForm/projectEmissionIntensitySchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { ProjectEmissionIntensityReportForm_projectRevision$key } from "__generated__/ProjectEmissionIntensityReportForm_projectRevision.graphql";

import { Button } from "@button-inc/bcgov-theme";
import { useCreateProjectEmissionIntensityFormChange } from "mutations/ProjectEmissionIntensity/addEmissionIntensityReportToRevision";
import { useUpdateEmissionIntensityReportFormChange } from "mutations/ProjectEmissionIntensity/updateEmissionIntensityReportFormChange";
import UndoChangesButton from "./UndoChangesButton";
import SavingIndicator from "./SavingIndicator";
import { MutableRefObject, useRef } from "react";
import { stageReportFormChanges } from "./Functions/reportingRequirementFormChangeFunctions";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
interface Props {
  projectRevision: ProjectEmissionIntensityReportForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

const ProjectEmissionsIntensityReport: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectEmissionIntensityReportForm_projectRevision on ProjectRevision {
        id
        rowId
        emissionIntensityReportingRequirementFormChange: formChangesFor(
          first: 1
          formDataTableName: "reporting_requirement"
          reportType: "TEIMP"
          filter: { operation: { notEqualTo: ARCHIVE } }
        )
          @connection(
            key: "connection_emissionIntensityReportingRequirementFormChange"
          ) {
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
            }
          }
        }
        emissionIntensityReportFormChange: formChangesFor(
          first: 1
          formDataTableName: "emission_intensity_report"
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_emissionIntensityReportFormChange") {
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
    projectRevision.emissionIntensityReportFormChange.edges[0]?.node;

  const reportingRequirementFormChange =
    projectRevision.emissionIntensityReportingRequirementFormChange.edges[0]
      ?.node;

  const [
    addProjectEmissionsIntensityReport,
    isAddingEmissionsIntensityReportFormChange,
  ] = useCreateProjectEmissionIntensityFormChange();
  const [
    updateEmissionsIntensityReportFormChange,
    isUpdatingEmissionsIntensityReportFormChange,
  ] = useUpdateEmissionIntensityReportFormChange();
  const [updateFormChange, isUpdatingFormChange] = useUpdateFormChange();

  const handleChange = (
    formChangeObject,
    changeData,
    changeStatus: "staged" | "pending"
  ) => {
    // don't trigger a change if the form data is an empty object
    if (changeData && Object.keys(changeData).length === 0) return;

    const updatedFormData = {
      ...formChangeObject.newFormData,
      ...changeData,
    };
    updateEmissionsIntensityReportFormChange({
      variables: {
        input: {
          id: formChangeObject.id,
          formChangePatch: {
            newFormData: updatedFormData,
            changeStatus: changeStatus,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChangeObject.id,
            newFormData: updatedFormData,
            changeStatus: changeStatus,
          },
        },
      },
      debounceKey: formChangeObject.id,
    });
  };

  return (
    <>
      {projectRevision.emissionIntensityReportFormChange.edges.length === 0 && (
        <Button
          disabled={isAddingEmissionsIntensityReportFormChange}
          onClick={() =>
            addProjectEmissionsIntensityReport({
              variables: {
                input: {
                  revisionId: projectRevision.rowId,
                },
              },
            })
          }
          style={{ marginRight: "1rem" }}
        >
          Add TEIMP Agreement
        </Button>
      )}
      {projectRevision.emissionIntensityReportFormChange.edges.length > 0 && (
        <>
          <header>
            <h3>Emission Intensity Report</h3>
            <UndoChangesButton
              formChangeIds={[
                emissionIntensityReportFormChange.rowId,
                reportingRequirementFormChange.rowId,
              ]}
              formRefs={formRefs}
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
            schema={emissionIntensityReportingRequirementSchema as JSONSchema7}
            formData={reportingRequirementFormChange?.newFormData}
            formContext={{
              form: reportingRequirementFormChange?.newFormData,
            }}
            uiSchema={emissionIntensityReportingRequirementUiSchema}
            onChange={(change) =>
              handleChange(
                reportingRequirementFormChange,
                change.formData,
                "pending"
              )
            }
          />
          <FormBase
            id="TEIMP_EmissionIntensityReportForm"
            ref={(el) =>
              (formRefs.current[emissionIntensityReportFormChange.id] = el)
            }
            validateOnMount={
              emissionIntensityReportFormChange?.changeStatus === "staged"
            }
            idPrefix="TEIMP_EmissionIntensityReportForm"
            schema={emissionIntensityReportSchema as JSONSchema7}
            formData={emissionIntensityReportFormChange?.newFormData}
            formContext={{
              form: emissionIntensityReportFormChange?.newFormData,
            }}
            uiSchema={emissionIntensityReportUiSchema}
            onChange={(change) =>
              handleChange(
                emissionIntensityReportFormChange,
                change.formData,
                "pending"
              )
            }
          />
          <Button
            size="medium"
            variant="primary"
            onClick={() => {
              stageReportFormChanges(
                updateEmissionsIntensityReportFormChange,
                props.onSubmit,
                formRefs,
                [
                  ...projectRevision
                    .emissionIntensityReportingRequirementFormChange.edges,
                  ...projectRevision.emissionIntensityReportFormChange.edges,
                ],
                "TEIMP",
                updateFormChange
              );
            }}
            disabled={
              isAddingEmissionsIntensityReportFormChange ||
              isUpdatingEmissionsIntensityReportFormChange ||
              isUpdatingFormChange
            }
          >
            Submit TEIMP Report
          </Button>
        </>
      )}
    </>
  );
};

export default ProjectEmissionsIntensityReport;
