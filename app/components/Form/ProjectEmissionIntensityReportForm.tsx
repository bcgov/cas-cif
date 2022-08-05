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
import useShowGrowthbookFeature from "lib/growthbookWrapper";
interface Props {
  projectRevision: ProjectEmissionIntensityReportForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

// passing content suffix to fields that need nominator and denominator (example: tCO2e/GJ)
export const createEmissionIntensityReportUiSchema = (
  emissionFunctionalUnit: string,
  productionFunctionalUnit?: string,
  viewOnly?: boolean
) => {
  // setting a deep copy of the ui schema to avoid mutating the original
  const uiSchemaCopy = JSON.parse(
    JSON.stringify(emissionIntensityReportUiSchema)
  );

  // Example: tCO2e/GJ if we have emissionFunctionalUnit
  const contentSuffix: JSX.Element = emissionFunctionalUnit && (
    <b>{`${emissionFunctionalUnit}${
      productionFunctionalUnit ? `/${productionFunctionalUnit}` : ""
    }`}</b>
  );

  // We only show the label of this field on view mode and summary page
  if (viewOnly) uiSchemaCopy.productionFunctionalUnit["ui:label"] = "";

  uiSchemaCopy.baselineEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.baselineEmissionIntensity["ui:options"],
    contentSuffix,
  };
  uiSchemaCopy.targetEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.targetEmissionIntensity["ui:options"],
    contentSuffix,
  };
  uiSchemaCopy.postProjectEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.postProjectEmissionIntensity["ui:options"],
    contentSuffix,
  };
  uiSchemaCopy.totalLifetimeEmissionReduction["ui:options"] = {
    ...uiSchemaCopy.totalLifetimeEmissionReduction["ui:options"],
    contentSuffix,
  };

  return uiSchemaCopy;
};

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
              asEmissionIntensityReport {
                calculatedEiPerformance
              }
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

  const calculatedEiPerformance =
    projectRevision.emissionIntensityReportFormChange.edges[0]?.node
      .asEmissionIntensityReport.calculatedEiPerformance;

  // Mutations
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

  // Growthbook - teimp
  if (!useShowGrowthbookFeature("teimp")) return null;
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
              calculatedValue: calculatedEiPerformance,
              isPercent: true,
            }}
            uiSchema={createEmissionIntensityReportUiSchema(
              emissionIntensityReportFormChange?.newFormData
                ?.emissionFunctionalUnit,
              emissionIntensityReportFormChange?.newFormData
                ?.productionFunctionalUnit,
              true
            )}
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
          <style jsx>{`
            :global(.functional-unit) {
              display: inline-block;
              vertical-align: bottom;
              padding-right: 0.5em;
            }
            :global(.functional-unit:nth-child(even)) {
              width: 6rem;
              white-space: nowrap;
            }
          `}</style>
        </>
      )}
    </>
  );
};

export default ProjectEmissionsIntensityReport;
