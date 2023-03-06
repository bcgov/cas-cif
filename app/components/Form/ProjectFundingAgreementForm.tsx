// brianna - commit handler, pgtap tests, jest tests, dev data, diffs are for whole array element, source numbering
import { Button, RadioButton } from "@button-inc/bcgov-theme";
import { fundingParameterEPUiSchema } from "data/jsonSchemaForm/fundingParameterEPUiSchema";
import { fundingParameterIAUiSchema } from "data/jsonSchemaForm/fundingParameterIAUiSchema";
import { JSONSchema7Definition } from "json-schema";
import { calculateProponentsSharePercentage } from "lib/helpers/fundingAgreementCalculations";
import AdditionalFundingSourcesFieldTemplate from "lib/theme/AdditionalFundingSourcesFieldTemplate";
import DangerAlert from "lib/theme/ConfirmationAlert";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";
import { useCreateFundingParameterFormChange } from "mutations/FundingParameter/createFundingParameterFormChange";
import useDiscardFundingParameterFormChange from "mutations/FundingParameter/discardFundingParameterFormChange";
import { useUpdateFundingParameterFormChange } from "mutations/FundingParameter/updateFundingParameterFormChange";
import { useMemo, useRef, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectFundingAgreementForm_projectRevision$key } from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";
import { ProjectFundingAgreementForm_query$key } from "__generated__/ProjectFundingAgreementForm_query.graphql";
import FormBase from "./FormBase";
import { stageReportFormChanges } from "./Functions/reportingRequirementFormChangeFunctions";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";

interface Props {
  query: ProjectFundingAgreementForm_query$key;
  projectRevision: ProjectFundingAgreementForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

const ProjectFundingAgreementForm: React.FC<Props> = (props) => {
  const formRefs = useRef<Record<string, any>>({});
  // Mutations
  const [createFundingParameterFormChange, isAddingFundingParameterFormChange] =
    useCreateFundingParameterFormChange();

  const [
    updateFundingParameterFormChange,
    isUpdatingFundingParameterFormChange,
  ] = useUpdateFundingParameterFormChange();
  const [stageFormChange, isStaging] = useStageFormChange();

  const [
    discardFundingParameterFormChange,
    isDiscardingFundingParameterFormChange,
  ] = useDiscardFundingParameterFormChange();

  const projectRevision = useFragment(
    graphql`
      fragment ProjectFundingAgreementForm_projectRevision on ProjectRevision {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...AnticipatedFundingAmountPerFiscalYearWidget_projectRevision
        id
        rowId
        projectFormChange {
          formDataRecordId
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                name
              }
            }
          }
        }
        totalProjectValue
        projectFundingAgreementFormChanges: formChangesFor(
          first: 500
          formDataTableName: "funding_parameter"
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_projectFundingAgreementFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              eligibleExpensesToDate
              holdbackAmountToDate
              netPaymentsToDate
              grossPaymentsToDate
              calculatedTotalPaymentAmountToDate
            }
          }
        }
        additionalFundingSourceFormChanges: formChangesFor(
          first: 500
          formDataTableName: "additional_funding_source"
        ) @connection(key: "connection_additionalFundingSourceFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              operation
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const fundingStream =
    projectRevision.projectFormChange.asProject
      .fundingStreamRfpByFundingStreamRfpId.fundingStreamByFundingStreamId.name;

  const isFundingStreamEP = fundingStream === "EP";

  const {
    allAdditionalFundingSourceStatuses,
    epFundingParameterFormBySlug,
    iaFundingParameterFormBySlug,
  } = useFragment(
    graphql`
      fragment ProjectFundingAgreementForm_query on Query {
        allAdditionalFundingSourceStatuses {
          edges {
            node {
              statusName
            }
          }
        }
        epFundingParameterFormBySlug: formBySlug(slug: "funding_parameter_EP") {
          jsonSchema
        }
        iaFundingParameterFormBySlug: formBySlug(slug: "funding_parameter_IA") {
          jsonSchema
        }
      }
    `,
    props.query
  );

  const fundingAgreement =
    projectRevision.projectFundingAgreementFormChanges.edges[0]?.node;

  // Update schema to include additional funding source dropdown options
  const schema = isFundingStreamEP
    ? { ...epFundingParameterFormBySlug.jsonSchema.schema }
    : { ...iaFundingParameterFormBySlug.jsonSchema.schema };
  const parsedSchema = JSON.parse(JSON.stringify(schema));
  parsedSchema.definitions.additionalFundingSource.properties.status = {
    ...parsedSchema.definitions.additionalFundingSource.properties.status,
    anyOf: allAdditionalFundingSourceStatuses.edges.map(({ node }) => {
      return {
        type: "string",
        title: node.statusName,
        enum: [node.statusName],
        value: node.statusName,
      } as JSONSchema7Definition;
    }),
  };

  const calculatedProponentsSharePercentage =
    calculateProponentsSharePercentage(
      fundingAgreement?.newFormData.proponentCost,
      Number(projectRevision.totalProjectValue)
    );

  // We should explicitly filter out archived form changes here (filtering on the fragment doesn't work)
  const filteredAdditionalFundingSourceFormChanges =
    projectRevision.additionalFundingSourceFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );
  // putting the conditional directly in the mutation throws errors
  const jsonSchemaName = isFundingStreamEP
    ? "funding_parameter_EP"
    : "funding_parameter_IA";

  const addFundingAgreement = () => {
    createFundingParameterFormChange({
      variables: {
        input: {
          projectRevisionId: projectRevision.rowId,
          formDataSchemaName: "cif",
          formDataTableName: "funding_parameter",
          jsonSchemaName,
          operation: "CREATE",
          newFormData: {
            projectId: projectRevision.projectFormChange.formDataRecordId,
            provinceSharePercentage: 50, // Default to 50%
            ...(isFundingStreamEP && { holdbackPercentage: 10 }), // Default to 10%
          },
        },
        connections: [projectRevision.projectFundingAgreementFormChanges.__id],
      },
    });
  };

  const handleChange = (formData) => {
    // don't trigger a change if the form data is an empty object
    if (formData && Object.keys(formData).length === 0) return;

    if (fundingAgreement) {
      const updatedFormData = {
        ...fundingAgreement.newFormData,
        ...formData,
      };
      updateFundingParameterFormChange({
        variables: {
          input: {
            rowId: fundingAgreement.rowId,
            formChangePatch: {
              newFormData: updatedFormData,
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: fundingAgreement.id,
              newFormData: updatedFormData,
              changeStatus: "pending",
            },
          },
        },
        debounceKey: fundingAgreement.id,
      });
    }
  };

  const handleError = () => {
    stageFormChange({
      variables: {
        input: {
          rowId: fundingAgreement.rowId,
          formChangePatch: { newFormData: fundingAgreement.newFormData },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: fundingAgreement.id,
            changeStatus: "staged",
          },
        },
      },
    });
  };

  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);

  const handleDiscard = () => {
    setShowDiscardConfirmation(false);
    discardFundingParameterFormChange({
      variables: {
        input: {
          revisionId: projectRevision.rowId,
        },
        connections: [],
        reportType: "funding_parameter",
      },
    });
  };
  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    const additionalFundingSourceFormChangeIds =
      projectRevision.additionalFundingSourceFormChanges.edges.map(
        ({ node }) => node?.rowId
      );
    const fundingAgreementFormChangeId =
      projectRevision.projectFundingAgreementFormChanges.edges[0]?.node?.rowId;
    return [
      ...additionalFundingSourceFormChangeIds,
      fundingAgreementFormChangeId,
    ];
  }, [
    projectRevision.projectFundingAgreementFormChanges,
    projectRevision.additionalFundingSourceFormChanges,
  ]);

  return (
    <>
      {projectRevision.projectFundingAgreementFormChanges.edges.length ===
        0 && (
        <div>
          <h3>Is this a funded project?</h3>
          <RadioButton
            name="funding-agreement"
            label="Yes"
            className="radio-button"
            onClick={addFundingAgreement}
            disabled={isDiscardingFundingParameterFormChange}
          />
          <RadioButton
            name="funding-agreement"
            label="No"
            className="radio-button"
          />
        </div>
      )}
      {projectRevision.projectFundingAgreementFormChanges.edges.length > 0 && (
        <>
          <div>
            <h3>Is this a funded project?</h3>
            <RadioButton
              name="funding-agreement"
              label="Yes"
              className="radio-button"
              checked={true}
            />
            <RadioButton
              name="funding-agreement"
              label="No"
              className="radio-button"
              onClick={() => setShowDiscardConfirmation(true)}
              disabled={isDiscardingFundingParameterFormChange}
              checked={false}
            />
            {showDiscardConfirmation && (
              <DangerAlert
                onProceed={handleDiscard}
                onCancel={() => setShowDiscardConfirmation(false)}
                alertText="All changes made will be deleted."
              />
            )}
          </div>
          <header>
            <h3>Budgets, Expenses & Payments</h3>
            <UndoChangesButton
              formChangeIds={formChangeIds}
              formRefs={formRefs}
            />
            <SavingIndicator
              isSaved={
                !isUpdatingFundingParameterFormChange &&
                !isAddingFundingParameterFormChange &&
                !isStaging
              }
            />
          </header>
          <FormBase
            id="ProjectFundingAgreementForm"
            validateOnMount={fundingAgreement?.changeStatus === "staged"}
            idPrefix="ProjectFundingAgreementForm"
            schema={parsedSchema}
            formData={fundingAgreement?.newFormData}
            formContext={{
              projectRevision,
              form: fundingAgreement?.newFormData,
              calculatedTotalProjectValue: projectRevision.totalProjectValue,
              calculatedProponentsSharePercentage,
              calculatedTotalPaymentAmountToDate:
                projectRevision.projectFundingAgreementFormChanges?.edges[0]
                  .node.calculatedTotalPaymentAmountToDate,
              calculatedEligibleExpensesToDate:
                projectRevision.projectFundingAgreementFormChanges?.edges[0]
                  .node.eligibleExpensesToDate,
              calculatedHoldbackAmountToDate:
                projectRevision.projectFundingAgreementFormChanges?.edges[0]
                  .node.holdbackAmountToDate,
              calculatedNetPaymentsToDate:
                projectRevision.projectFundingAgreementFormChanges?.edges[0]
                  .node.netPaymentsToDate,
              calculatedGrossPaymentsToDate:
                projectRevision.projectFundingAgreementFormChanges?.edges[0]
                  .node.grossPaymentsToDate,
            }}
            uiSchema={
              isFundingStreamEP
                ? fundingParameterEPUiSchema
                : fundingParameterIAUiSchema
            }
            FieldTemplate={AdditionalFundingSourcesFieldTemplate}
            ObjectFieldTemplate={EmptyObjectFieldTemplate}
            ref={(el) => el && (formRefs.current[fundingAgreement.id] = el)}
            onChange={(change) => handleChange(change.formData)}
            onError={handleError}
          ></FormBase>
          <Button
            type="submit"
            onClick={() =>
              stageReportFormChanges(
                () => {},
                props.onSubmit,
                formRefs,
                [
                  ...projectRevision.projectFundingAgreementFormChanges.edges,
                  ...filteredAdditionalFundingSourceFormChanges,
                ],
                null,
                stageFormChange
              )
            }
            style={{ marginRight: "1rem" }}
            disabled={
              isUpdatingFundingParameterFormChange ||
              isAddingFundingParameterFormChange ||
              isStaging
            }
          >
            Submit Budgets, Expenses & Payments
          </Button>
        </>
      )}
      <style jsx>
        {`
          div :global(.radio-button) {
            margin-top: 1rem;
            margin-left: 1rem;
          }
          div {
            margin-bottom: 2rem;
          }
          div :global(fieldset) {
            border: 0px !important;
            border-radius: 0.25em !important;
            padding: 2em;
          }
          :global(#ProjectFundingAgreementForm_anticipatedFundingAmountPerFiscalYear) {
            border: none;
            padding: 0;
          }
        `}
      </style>
    </>
  );
};

export default ProjectFundingAgreementForm;
