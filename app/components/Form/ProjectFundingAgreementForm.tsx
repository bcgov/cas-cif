import { Button, RadioButton } from "@button-inc/bcgov-theme";
import { fundingParameterEPUiSchema } from "data/jsonSchemaForm/fundingParameterEPUiSchema";
import { fundingParameterIAUiSchema } from "data/jsonSchemaForm/fundingParameterIAUiSchema";
import { JSONSchema7Definition } from "json-schema";
import FormBorder from "lib/theme/components/FormBorder";
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
import AdditionalFundingSourcesArrayFieldTemplate from "./AdditionalFundingSourcesArrayFieldTemplate";
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
              totalProjectValue
              proponentsSharePercentage
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

  const fundingAgreement =
    projectRevision.projectFundingAgreementFormChanges.edges[0]?.node;

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
    const fundingAgreementFormChangeId =
      projectRevision.projectFundingAgreementFormChanges.edges[0]?.node?.rowId;
    return [fundingAgreementFormChangeId];
  }, [projectRevision.projectFundingAgreementFormChanges]);

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
          <FormBorder>
            <FormBase
              id="ProjectFundingAgreementForm"
              validateOnMount={fundingAgreement?.changeStatus === "staged"}
              idPrefix="ProjectFundingAgreementForm"
              schema={parsedSchema}
              formData={fundingAgreement?.newFormData}
              formContext={{
                projectRevision,
                form: fundingAgreement?.newFormData,
                calculatedTotalProjectValue: fundingAgreement.totalProjectValue,
                calculatedProponentsSharePercentage:
                  fundingAgreement.proponentsSharePercentage,
                calculatedTotalPaymentAmountToDate:
                  fundingAgreement.calculatedTotalPaymentAmountToDate,
                calculatedEligibleExpensesToDate:
                  fundingAgreement.eligibleExpensesToDate,
                calculatedHoldbackAmountToDate:
                  fundingAgreement.holdbackAmountToDate,
                calculatedNetPaymentsToDate: fundingAgreement.netPaymentsToDate,
                calculatedGrossPaymentsToDate:
                  fundingAgreement.grossPaymentsToDate,
              }}
              uiSchema={
                isFundingStreamEP
                  ? fundingParameterEPUiSchema
                  : fundingParameterIAUiSchema
              }
              ObjectFieldTemplate={EmptyObjectFieldTemplate}
              ArrayFieldTemplate={AdditionalFundingSourcesArrayFieldTemplate}
              ref={(el) => el && (formRefs.current[fundingAgreement.id] = el)}
              onChange={(change) => handleChange(change.formData)}
              onError={handleError}
            ></FormBase>
          </FormBorder>
          <Button
            type="submit"
            onClick={() =>
              stageReportFormChanges(
                () => {},
                props.onSubmit,
                formRefs,
                [...projectRevision.projectFundingAgreementFormChanges.edges],
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
