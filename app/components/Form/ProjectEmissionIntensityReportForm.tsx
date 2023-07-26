import { Button } from "@button-inc/bcgov-theme";
import {
  emissionIntensityReportingRequirementGroupSchema,
  emissionIntensityReportingRequirementUiSchema,
} from "data/jsonSchemaForm/emissionIntensityUiSchema";
import { JSONSchema7 } from "json-schema";
import getDurationFromDates from "lib/helpers/getDurationFromDates";
import GroupedObjectFieldTemplateWrapper from "lib/theme/GroupedObjectFieldTemplateWrapper";
import { useCreateEmissionIntensityReport } from "mutations/ProjectEmissionIntensity/createEmissionIntensityReport";
import { useUpdateEmissionIntensityReportFormChange } from "mutations/ProjectEmissionIntensity/updateEmissionIntensityReportFormChange";
import { useStageReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/stageReportingRequirementFormChange";
import { MutableRefObject, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectEmissionIntensityReportForm_projectRevision$key } from "__generated__/ProjectEmissionIntensityReportForm_projectRevision.graphql";
import { ProjectEmissionIntensityReportForm_query$key } from "__generated__/ProjectEmissionIntensityReportForm_query.graphql";
import { EmissionIntensityReportStatus } from "./EmissionIntensityReportStatus";
import FormBase from "./FormBase";
import { stageReportFormChanges } from "./Functions/reportingRequirementFormChangeFunctions";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
interface Props {
  query: ProjectEmissionIntensityReportForm_query$key;
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
    JSON.stringify(emissionIntensityReportingRequirementUiSchema)
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
  if (viewOnly) uiSchemaCopy.productionFunctionalUnit["ui:label"] = "";

  uiSchemaCopy.baselineEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.baselineEmissionIntensity["ui:options"],
    contentSuffix: contentSuffix(
      emissionFunctionalUnit,
      productionFunctionalUnit
    ),
  };
  uiSchemaCopy.targetEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.targetEmissionIntensity["ui:options"],
    contentSuffix: contentSuffix(
      emissionFunctionalUnit,
      productionFunctionalUnit
    ),
  };
  uiSchemaCopy.postProjectEmissionIntensity["ui:options"] = {
    ...uiSchemaCopy.postProjectEmissionIntensity["ui:options"],
    contentSuffix: contentSuffix(
      emissionFunctionalUnit,
      productionFunctionalUnit
    ),
  };
  uiSchemaCopy.totalLifetimeEmissionReduction["ui:options"] = {
    ...uiSchemaCopy.totalLifetimeEmissionReduction["ui:options"],
    contentSuffix: contentSuffix(emissionFunctionalUnit),
  };

  uiSchemaCopy.measurementPeriodEndDate["ui:options"] = {
    ...uiSchemaCopy.measurementPeriodEndDate["ui:options"],
    contentSuffix: reportDurationSuffix,
  };

  uiSchemaCopy.emissionFunctionalUnit["ui:options"] = {
    ...uiSchemaCopy.emissionFunctionalUnit["ui:options"],
    contentSuffix: emissionFunctionalUnitSuffix(),
  };

  return uiSchemaCopy;
};

const ProjectEmissionsIntensityReport: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const { eiFormBySlug } = useFragment(
    graphql`
      fragment ProjectEmissionIntensityReportForm_query on Query {
        eiFormBySlug: formBySlug(slug: "emission_intensity") {
          jsonSchema
        }
      }
    `,
    props.query
  );

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
              calculatedEiPerformance
              paymentPercentage
              maximumPerformanceMilestoneAmount
              actualPerformanceMilestoneAmount
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const emissionIntensityReportingRequirementFormChange =
    projectRevision.emissionIntensityReportingRequirementFormChange.edges[0]
      ?.node;
  console.log(
    "emissionIntensityReportingRequirementFormChange",
    emissionIntensityReportingRequirementFormChange
  );
  const calculatedEiPerformance =
    emissionIntensityReportingRequirementFormChange?.calculatedEiPerformance;

  const maximumPerformanceMilestoneAmount =
    emissionIntensityReportingRequirementFormChange?.maximumPerformanceMilestoneAmount;

  const paymentPercentageOfPerformanceMilestoneAmount =
    emissionIntensityReportingRequirementFormChange?.paymentPercentage;

  // Mutations
  const [createEmissionsIntensityReport, isCreatingEmissionsIntensityReport] =
    useCreateEmissionIntensityReport();
  const [
    updateEmissionsIntensityReportFormChange,
    isUpdatingEmissionsIntensityReportFormChange,
  ] = useUpdateEmissionIntensityReportFormChange();

  const [
    applyStageReportingRequirementFormChangeMutation,
    isStagingReportingRequirement,
  ] = useStageReportingRequirementFormChange();

  const handleChange = (formChangeObject, changeData) => {
    // don't trigger a change if the form data is an empty object
    if (changeData && Object.keys(changeData).length === 0) return;

    const updatedFormData = {
      ...formChangeObject.newFormData,
      ...changeData,
    };

    updateEmissionsIntensityReportFormChange({
      variables: {
        input: {
          rowId: formChangeObject.rowId,
          formChangePatch: {
            newFormData: {
              ...formChangeObject.newFormData,
              ...changeData,
            },
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

  return (
    <>
      {projectRevision.emissionIntensityReportingRequirementFormChange.edges
        .length === 0 && (
        <Button
          disabled={isCreatingEmissionsIntensityReport}
          onClick={() =>
            createEmissionsIntensityReport({
              variables: {
                input: {
                  operation: "CREATE",
                  formDataSchemaName: "cif",
                  formDataTableName: "reporting_requirement",
                  jsonSchemaName: "emission_intensity",
                  newFormData: {
                    reportType: "TEIMP",
                    reportingRequirementIndex: 1,
                    emissionFunctionalUnit: "tCO2e",
                  },
                  projectRevisionId: projectRevision.rowId,
                },
              },
            })
          }
          style={{ marginRight: "1rem" }}
        >
          Add Emissions Intensity Report
        </Button>
      )}
      {projectRevision.emissionIntensityReportingRequirementFormChange.edges
        .length > 0 && (
        <>
          <header>
            <h3>Emission Intensity Report</h3>
            <UndoChangesButton
              formChangeIds={[
                emissionIntensityReportingRequirementFormChange.rowId,
              ]}
              formRefs={formRefs}
            />
            <SavingIndicator
              isSaved={
                !isUpdatingEmissionsIntensityReportFormChange &&
                !isCreatingEmissionsIntensityReport
              }
            />
          </header>
          <EmissionIntensityReportStatus
            reportDueDateString={
              emissionIntensityReportingRequirementFormChange?.newFormData
                .reportDueDate
            }
            submittedDateString={
              emissionIntensityReportingRequirementFormChange?.newFormData
                .submittedDate
            }
            emissionIntensityEndDateString={
              emissionIntensityReportingRequirementFormChange?.newFormData
                .measurementPeriodEndDate
            }
          />
          <FormBase
            id="TEIMP_ReportingRequirementForm"
            ref={(el) =>
              el &&
              (formRefs.current[
                emissionIntensityReportingRequirementFormChange.id
              ] = el)
            }
            validateOnMount={
              emissionIntensityReportingRequirementFormChange?.changeStatus ===
              "staged"
            }
            idPrefix="TEIMP_ReportingRequirementForm"
            schema={eiFormBySlug.jsonSchema.schema as JSONSchema7}
            formData={
              emissionIntensityReportingRequirementFormChange?.newFormData
            }
            formContext={{
              form: emissionIntensityReportingRequirementFormChange?.newFormData,
              calculatedEiPerformance: calculatedEiPerformance ?? null,
              paymentPercentageOfPerformanceMilestoneAmount:
                paymentPercentageOfPerformanceMilestoneAmount ?? null,
              maximumPerformanceMilestoneAmount:
                maximumPerformanceMilestoneAmount ?? null,
              actualPerformanceMilestoneAmount:
                projectRevision.emissionIntensityReportingRequirementFormChange
                  .edges[0]?.node.actualPerformanceMilestoneAmount,
              groupSchema: emissionIntensityReportingRequirementGroupSchema,
            }}
            uiSchema={createEmissionIntensityReportUiSchema(
              emissionIntensityReportingRequirementFormChange?.newFormData
                ?.emissionFunctionalUnit,
              emissionIntensityReportingRequirementFormChange?.newFormData
                ?.productionFunctionalUnit,
              emissionIntensityReportingRequirementFormChange?.newFormData
                ?.measurementPeriodStartDate,
              emissionIntensityReportingRequirementFormChange?.newFormData
                ?.measurementPeriodEndDate,
              true
            )}
            ObjectFieldTemplate={GroupedObjectFieldTemplateWrapper}
            onChange={(change) =>
              handleChange(
                emissionIntensityReportingRequirementFormChange,
                change.formData
              )
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
                ],
                "TEIMP"
              );
            }}
            disabled={
              isCreatingEmissionsIntensityReport ||
              isUpdatingEmissionsIntensityReportFormChange ||
              isStagingReportingRequirement
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
