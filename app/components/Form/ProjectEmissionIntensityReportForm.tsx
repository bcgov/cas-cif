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
import { useStageReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/stageReportingRequirementFormChange";
import { useStageEmissionIntensityFormChange } from "mutations/ProjectEmissionIntensity/stageEmissionIntensityFormChange";
import useShowGrowthbookFeature from "lib/growthbookWrapper";
import { EmissionIntensityReportStatus } from "./EmissionIntensityReportStatus";
import getDurationFromDates from "lib/helpers/getDurationFromDates";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
interface Props {
  projectRevision: ProjectEmissionIntensityReportForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

// passing content suffix to fields that need nominator and denominator (example: tCO2e/GJ)
export const createEmissionIntensityReportUiSchema = (
  emissionFunctionalUnit: string,
  productionFunctionalUnit?: string,
  measurementPeriodStartDate?: string,
  measurementPeriodEndDate?: string,
  viewOnly?: boolean
) => {
  // setting a deep copy of the ui schema to avoid mutating the original
  const uiSchemaCopy = JSON.parse(
    JSON.stringify(emissionIntensityReportUiSchema)
  );

  // Example: tCO2e/GJ if we have emissionFunctionalUnit
  const contentSuffix = (
    emissionUnit: string,
    productionUnit?: string
  ): JSX.Element => {
    return (
      emissionUnit && (
        <b>{`${emissionUnit}${productionUnit ? `/${productionUnit}` : ""}`}</b>
      )
    );
  };

  const emissionFunctionalUnitSuffix = (): JSX.Element => {
    return (
      <b className="unitSuffix">
        /
        <style jsx>{`
          .unitSuffix {
            margin-right: 0.5rem;
            margin-left: -1rem;
          }
        `}</style>
      </b>
    );
  };

  const reportDuration = getDurationFromDates(
    measurementPeriodStartDate,
    measurementPeriodEndDate
  );
  const reportDurationSuffix = reportDuration && (
    <b className="contentSuffix">
      Duration: {reportDuration}
      <style jsx>{`
        .contentSuffix {
          font-size: 0.8rem;
        }
      `}</style>
    </b>
  );

  // We only show the label of this field on view mode and summary page
  if (viewOnly)
    uiSchemaCopy.teimpReporting.productionFunctionalUnit["ui:label"] = "";

  uiSchemaCopy.teimpReporting.baselineEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.teimpReporting.baselineEmissionIntensity["ui:options"],
    contentSuffix: contentSuffix(
      emissionFunctionalUnit,
      productionFunctionalUnit
    ),
  };
  uiSchemaCopy.teimpReporting.targetEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.teimpReporting.targetEmissionIntensity["ui:options"],
    contentSuffix: contentSuffix(
      emissionFunctionalUnit,
      productionFunctionalUnit
    ),
  };
  uiSchemaCopy.teimpReporting.postProjectEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.teimpReporting.postProjectEmissionIntensity["ui:options"],
    contentSuffix: contentSuffix(
      emissionFunctionalUnit,
      productionFunctionalUnit
    ),
  };
  uiSchemaCopy.teimpReporting.totalLifetimeEmissionReduction["ui:options"] = {
    ...uiSchemaCopy.teimpReporting.totalLifetimeEmissionReduction["ui:options"],
    contentSuffix: contentSuffix(emissionFunctionalUnit),
  };

  uiSchemaCopy.teimpReporting.measurementPeriodEndDate["ui:options"] = {
    ...uiSchemaCopy.teimpReporting.measurementPeriodEndDate["ui:options"],
    contentSuffix: reportDurationSuffix,
  };

  uiSchemaCopy.teimpReporting.emissionFunctionalUnit["ui:options"] = {
    ...uiSchemaCopy.teimpReporting.emissionFunctionalUnit["ui:options"],
    contentSuffix: emissionFunctionalUnitSuffix(),
  };
  uiSchemaCopy["ui:ObjectFieldTemplate"] = EmptyObjectFieldTemplate; // Don't outline the parent object
  return uiSchemaCopy;
};

const ProjectEmissionsIntensityReport: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectEmissionIntensityReportForm_projectRevision on ProjectRevision {
        id
        rowId
        teimpPaymentPercentage
        teimpPaymentAmount
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
              holdbackAmountToDate
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
              calculatedEiPerformance
              id
              rowId
              newFormData
              changeStatus
              paymentPercentage
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
      .calculatedEiPerformance;

  const maximumPerformanceMilestoneAmount =
    projectRevision.emissionIntensityReportingRequirementFormChange.edges[0]
      ?.node.holdbackAmountToDate;
  const paymentPercentageOfPerformanceMilestoneAmount =
    projectRevision.emissionIntensityReportFormChange.edges[0]?.node
      .paymentPercentage;
  var actualPerformanceMilestoneAmount;
  if (
    maximumPerformanceMilestoneAmount == null ||
    paymentPercentageOfPerformanceMilestoneAmount == null
  ) {
    actualPerformanceMilestoneAmount = null;
  } else {
    actualPerformanceMilestoneAmount =
      Number(maximumPerformanceMilestoneAmount ?? null) *
      Number(paymentPercentageOfPerformanceMilestoneAmount ?? null);
  }

  // Mutations
  const [
    addProjectEmissionsIntensityReport,
    isAddingEmissionsIntensityReportFormChange,
  ] = useCreateProjectEmissionIntensityFormChange();
  const [
    updateEmissionsIntensityReportFormChange,
    isUpdatingEmissionsIntensityReportFormChange,
  ] = useUpdateEmissionIntensityReportFormChange();

  const [
    applyStageReportingRequirementFormChangeMutation,
    isStagingReportingRequirement,
  ] = useStageReportingRequirementFormChange();

  const [
    applyStageEmissionIntensityFormChangeMutation,
    isStagingEmissionIntensity,
  ] = useStageEmissionIntensityFormChange();

  const formData = emissionIntensityReportFormChange?.newFormData;

  const formattedFormData = {
    teimpReporting: {},
    uponCompletion: {},
  };

  Object.keys(emissionIntensityReportSchema.properties).forEach(
    (schemaProperty) =>
      Object.keys(
        emissionIntensityReportSchema.properties[schemaProperty].properties
      ).forEach(
        (key) =>
          formData?.[key] &&
          Object.assign(formattedFormData[schemaProperty], {
            [key]: formData[key],
          })
      )
  );

  console.log("Form data: ", formData);
  console.log("Formatted form data: ", formattedFormData);

  const handleChange = (formChangeObject, changeData) => {
    // don't trigger a change if the form data is an empty object
    if (changeData && Object.keys(changeData).length === 0) return;

    const updatedFormData = {
      ...formChangeObject.newFormData,
      ...changeData.teimpReporting,
      ...changeData.uponCompletion,
    };

    console.log("Updated form data: ", updatedFormData);

    updateEmissionsIntensityReportFormChange({
      variables: {
        input: {
          rowId: formChangeObject.rowId,
          formChangePatch: {
            newFormData: updatedFormData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChangeObject.id,
            newFormData: updatedFormData,
            changeStatus: "pending",
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
          Add Emissions Intensity Report
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
          <EmissionIntensityReportStatus
            reportDueDateString={
              reportingRequirementFormChange?.newFormData.reportDueDate
            }
            submittedDateString={
              reportingRequirementFormChange?.newFormData.submittedDate
            }
            emissionIntensityEndDateString={
              emissionIntensityReportFormChange?.newFormData
                .measurementPeriodEndDate
            }
          />
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
              handleChange(reportingRequirementFormChange, change.formData)
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
            formData={formattedFormData}
            formContext={{
              form: emissionIntensityReportFormChange?.newFormData,
              calculatedEiPerformance: calculatedEiPerformance ?? null,
              paymentPercentageOfPerformanceMilestoneAmount:
                paymentPercentageOfPerformanceMilestoneAmount ?? null,
              maximumPerformanceMilestoneAmount:
                maximumPerformanceMilestoneAmount ?? null,
              actualPerformanceMilestoneAmount:
                actualPerformanceMilestoneAmount ?? null,
              teimpPaymentPercentage:
                projectRevision.teimpPaymentPercentage ?? "-",
              teimpPaymentAmount: projectRevision.teimpPaymentAmount ?? "-",
              isPercentage: true,
            }}
            uiSchema={createEmissionIntensityReportUiSchema(
              emissionIntensityReportFormChange?.newFormData
                ?.emissionFunctionalUnit,
              emissionIntensityReportFormChange?.newFormData
                ?.productionFunctionalUnit,
              emissionIntensityReportFormChange?.newFormData
                ?.measurementPeriodStartDate,
              emissionIntensityReportFormChange?.newFormData
                ?.measurementPeriodEndDate,
              true
            )}
            onChange={(change) =>
              handleChange(emissionIntensityReportFormChange, change.formData)
            }
          />
          <Button
            size="medium"
            variant="primary"
            onClick={() => {
              stageReportFormChanges(
                applyStageReportingRequirementFormChangeMutation,
                props.onSubmit,
                formRefs,
                [
                  ...projectRevision
                    .emissionIntensityReportingRequirementFormChange.edges,
                  ...projectRevision.emissionIntensityReportFormChange.edges,
                ],
                "TEIMP",
                applyStageEmissionIntensityFormChangeMutation
              );
            }}
            disabled={
              isAddingEmissionsIntensityReportFormChange ||
              isUpdatingEmissionsIntensityReportFormChange ||
              isStagingReportingRequirement ||
              isStagingEmissionIntensity
            }
          >
            Submit Emissions Intensity Report
          </Button>
          <style jsx>{`
            :global(.functional-unit) {
              display: inline-block;
              vertical-align: bottom;
              padding-right: 0.5em;
            }
            :global(.functional-unit:nth-child(even)) {
              white-space: nowrap;
            }
          `}</style>
        </>
      )}
    </>
  );
};

export default ProjectEmissionsIntensityReport;
