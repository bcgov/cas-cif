import { utils } from "@rjsf/core";
import { SummaryFormProps } from "data/formPages/types";
import { fundingParameterEPUiSchema } from "data/jsonSchemaForm/fundingParameterEPUiSchema";
import { fundingParameterIAUiSchema } from "data/jsonSchemaForm/fundingParameterIAUiSchema";
import type { JSONSchema7 } from "json-schema";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { getSchemaAndDataIncludingCalculatedValues } from "lib/theme/schemaFilteringHelpers";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import React, { useEffect, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectFundingAgreementFormSummary_projectRevision$key } from "__generated__/ProjectFundingAgreementFormSummary_projectRevision.graphql";
import { ProjectFundingAgreementFormSummary_query$key } from "__generated__/ProjectFundingAgreementFormSummary_query.graphql";
import FormBase from "./FormBase";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";
import ReadOnlyArrayFieldTemplate from "./ReadOnlyArrayFieldTemplate";
import { cleanupNestedNodes } from "components/helpers";

const { fields } = utils.getDefaultRegistry();

// Set custom rjsf fields to display diffs
const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props
  extends SummaryFormProps<ProjectFundingAgreementFormSummary_projectRevision$key> {
  query: ProjectFundingAgreementFormSummary_query$key;
}

const ProjectFundingAgreementFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
  query,
}) => {
  const revision = useFragment(
    graphql`
      fragment ProjectFundingAgreementFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        projectFormChange {
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                name
              }
            }
          }
        }
        summaryProjectFundingAgreementFormChanges: formChangesFor(
          formDataTableName: "funding_parameter"
        ) {
          edges {
            node {
              newFormData
              eligibleExpensesToDate
              holdbackAmountToDate
              netPaymentsToDate
              grossPaymentsToDate
              calculatedTotalPaymentAmountToDate
              proponentsSharePercentage
              totalProjectValue
              anticipatedFundingAmountPerFiscalYear {
                edges {
                  # eslint-disable-next-line relay/unused-fields
                  node {
                    anticipatedFundingAmount
                    fiscalYear
                  }
                }
              }
              isPristine
              operation
              formChangeByPreviousFormChangeId {
                newFormData
                eligibleExpensesToDate
                holdbackAmountToDate
                netPaymentsToDate
                grossPaymentsToDate
                calculatedTotalPaymentAmountToDate
                proponentsSharePercentage
                totalProjectValue
                anticipatedFundingAmountPerFiscalYear {
                  edges {
                    # eslint-disable-next-line relay/unused-fields
                    node {
                      anticipatedFundingAmount
                      fiscalYear
                    }
                  }
                }
              }
            }
          }
        }
        latestCommittedFundingFormChanges: latestCommittedFormChangesFor(
          formDataTableName: "funding_parameter"
        ) {
          edges {
            node {
              newFormData
              eligibleExpensesToDate
              holdbackAmountToDate
              netPaymentsToDate
              grossPaymentsToDate
              calculatedTotalPaymentAmountToDate
              proponentsSharePercentage
              totalProjectValue
              anticipatedFundingAmountPerFiscalYear {
                edges {
                  # eslint-disable-next-line relay/unused-fields
                  node {
                    anticipatedFundingAmount
                    fiscalYear
                  }
                }
              }
            }
          }
        }
      }
    `,
    projectRevision
  );

  const { summaryProjectFundingAgreementFormChanges, isFirstRevision } =
    revision;

  const fundingAgreementSummary =
    summaryProjectFundingAgreementFormChanges.edges[0]?.node;

  const newData = {
    ...fundingAgreementSummary?.newFormData,
    eligibleExpensesToDate: fundingAgreementSummary?.eligibleExpensesToDate,
    holdbackAmountToDate: fundingAgreementSummary?.holdbackAmountToDate,
    netPaymentsToDate: fundingAgreementSummary?.netPaymentsToDate,
    grossPaymentsToDate: fundingAgreementSummary?.grossPaymentsToDate,
    totalPaymentAmountToDate:
      fundingAgreementSummary?.calculatedTotalPaymentAmountToDate,
    proponentsSharePercentage:
      fundingAgreementSummary?.proponentsSharePercentage,
    totalProjectValue: fundingAgreementSummary?.totalProjectValue,
    anticipatedFundingAmountPerFiscalYear: cleanupNestedNodes(
      fundingAgreementSummary?.anticipatedFundingAmountPerFiscalYear.edges
    ),
  };

  const latestCommittedFundingFormChanges =
    revision.latestCommittedFundingFormChanges?.edges[0]?.node;

  const latestCommittedData = {
    ...latestCommittedFundingFormChanges?.newFormData,
    eligibleExpensesToDate:
      latestCommittedFundingFormChanges?.eligibleExpensesToDate,
    holdbackAmountToDate:
      latestCommittedFundingFormChanges?.holdbackAmountToDate,
    netPaymentsToDate: latestCommittedFundingFormChanges?.netPaymentsToDate,
    grossPaymentsToDate: latestCommittedFundingFormChanges?.grossPaymentsToDate,
    totalPaymentAmountToDate:
      latestCommittedFundingFormChanges?.calculatedTotalPaymentAmountToDate,
    proponentsSharePercentage:
      latestCommittedFundingFormChanges?.proponentsSharePercentage,
    totalProjectValue: latestCommittedFundingFormChanges?.totalProjectValue,
    anticipatedFundingAmountPerFiscalYear: cleanupNestedNodes(
      latestCommittedFundingFormChanges?.anticipatedFundingAmountPerFiscalYear
        .edges
    ),
  };

  const oldFundingFormChanges =
    revision.summaryProjectFundingAgreementFormChanges.edges[0]?.node
      .formChangeByPreviousFormChangeId;

  const oldData = {
    ...oldFundingFormChanges?.newFormData,
    eligibleExpensesToDate: oldFundingFormChanges?.eligibleExpensesToDate,
    holdbackAmountToDate: oldFundingFormChanges?.holdbackAmountToDate,
    netPaymentsToDate: oldFundingFormChanges?.netPaymentsToDate,
    grossPaymentsToDate: oldFundingFormChanges?.grossPaymentsToDate,
    totalPaymentAmountToDate:
      oldFundingFormChanges?.calculatedTotalPaymentAmountToDate,
    proponentsSharePercentage: oldFundingFormChanges?.proponentsSharePercentage,
    totalProjectValue: oldFundingFormChanges?.totalProjectValue,
    anticipatedFundingAmountPerFiscalYear: cleanupNestedNodes(
      oldFundingFormChanges?.anticipatedFundingAmountPerFiscalYear.edges
    ),
  };

  const fundingStream =
    revision.projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
      .fundingStreamByFundingStreamId.name;

  const isFundingStreamEP = fundingStream === "EP";

  const { epFundingParameterFormBySlug, iaFundingParameterFormBySlug } =
    useFragment(
      graphql`
        fragment ProjectFundingAgreementFormSummary_query on Query {
          epFundingParameterFormBySlug: formBySlug(
            slug: "funding_parameter_EP"
          ) {
            jsonSchema
          }
          iaFundingParameterFormBySlug: formBySlug(
            slug: "funding_parameter_IA"
          ) {
            jsonSchema
          }
        }
      `,
      query
    );

  const schema = isFundingStreamEP
    ? epFundingParameterFormBySlug.jsonSchema.schema
    : iaFundingParameterFormBySlug.jsonSchema.schema;

  // Show diff if it is not the first revision and not view only (rendered from the overview page)
  const renderDiff = !isFirstRevision && !viewOnly;

  // Set the formSchema and formData based on showing the diff or not
  const { formSchema, formData } = !renderDiff
    ? {
        formSchema: schema,
        formData: {
          ...fundingAgreementSummary?.newFormData,
          anticipatedFundingAmountPerFiscalYear: cleanupNestedNodes(
            fundingAgreementSummary?.anticipatedFundingAmountPerFiscalYear.edges
          ),
        },
      }
    : {
        ...getSchemaAndDataIncludingCalculatedValues(
          schema as JSONSchema7,
          newData,
          oldData
        ),
      };

  const fundingAgreementFormNotUpdated = useMemo(
    () =>
      !fundingAgreementSummary ||
      fundingAgreementSummary?.isPristine ||
      (fundingAgreementSummary?.isPristine === null &&
        Object.keys(fundingAgreementSummary?.newFormData).length === 0),
    [fundingAgreementSummary]
  );

  const createUiSchema = useMemo(() => {
    if (isFundingStreamEP) {
      return {
        ...fundingParameterEPUiSchema,
        additionalFundingSources: {
          ...fundingParameterEPUiSchema.additionalFundingSources,
          "ui:ArrayFieldTemplate": ReadOnlyArrayFieldTemplate,
        },
        anticipatedFundingAmountPerFiscalYear: {
          ...fundingParameterEPUiSchema.anticipatedFundingAmountPerFiscalYear,
          "ui:ArrayFieldTemplate": ReadOnlyArrayFieldTemplate,
        },
      };
    }
    return {
      ...fundingParameterIAUiSchema,
      additionalFundingSources: {
        ...fundingParameterIAUiSchema.additionalFundingSources,
        "ui:ArrayFieldTemplate": ReadOnlyArrayFieldTemplate,
      },
      anticipatedFundingAmountPerFiscalYear: {
        ...fundingParameterIAUiSchema.anticipatedFundingAmountPerFiscalYear,
        "ui:ArrayFieldTemplate": ReadOnlyArrayFieldTemplate,
      },
    };
  }, []);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!fundingAgreementFormNotUpdated),
    [fundingAgreementFormNotUpdated, setHasDiff]
  );

  // This condition handles the case where the form is archived
  if (
    !fundingAgreementFormNotUpdated &&
    fundingAgreementSummary?.operation === "ARCHIVE"
  ) {
    return (
      <div>
        {!isOnAmendmentsAndOtherRevisionsPage && (
          <h3>Budgets, Expenses & Payments</h3>
        )}
        {!viewOnly ? (
          <>
            <FormRemoved
              isOnAmendmentsAndOtherRevisionsPage={
                isOnAmendmentsAndOtherRevisionsPage
              }
              formTitle="Budgets, Expenses & Payments"
            />
          </>
        ) : (
          <FormNotAddedOrUpdated
            isFirstRevision={true}
            formTitle="Budgets, Expenses & Payments"
          />
        )}
      </div>
    );
  }
  return (
    <div>
      {!isOnAmendmentsAndOtherRevisionsPage && (
        <h3>Budgets, Expenses & Payments</h3>
      )}
      {fundingAgreementFormNotUpdated && !viewOnly ? (
        !isOnAmendmentsAndOtherRevisionsPage ? (
          <FormNotAddedOrUpdated
            isFirstRevision={isFirstRevision}
            formTitle="Budgets, Expenses & Payments"
          />
        ) : (
          ""
        )
      ) : (
        <FormBase
          tagName={"dl"}
          theme={readOnlyTheme}
          fields={renderDiff ? customFields : fields}
          schema={formSchema as JSONSchema7}
          uiSchema={createUiSchema}
          formData={formData}
          formContext={{
            projectRevision: revision,
            operation: fundingAgreementSummary?.operation,
            calculatedTotalProjectValue:
              fundingAgreementSummary?.totalProjectValue,
            calculatedProponentsSharePercentage:
              fundingAgreementSummary?.proponentsSharePercentage,
            oldData,
            latestCommittedData,
            isAmendmentsAndOtherRevisionsSpecific:
              isOnAmendmentsAndOtherRevisionsPage,
            calculatedEligibleExpensesToDate:
              fundingAgreementSummary?.eligibleExpensesToDate,
            calculatedHoldbackAmountToDate:
              fundingAgreementSummary?.holdbackAmountToDate,
            calculatedNetPaymentsToDate:
              fundingAgreementSummary?.netPaymentsToDate,
            calculatedGrossPaymentsToDate:
              fundingAgreementSummary?.grossPaymentsToDate,
            calculatedTotalPaymentAmountToDate:
              fundingAgreementSummary?.calculatedTotalPaymentAmountToDate,
          }}
        />
      )}
      <style jsx>{`
        div :global(h3) {
          margin: 1em 0;
        }
        :global(.anticipatedFundingAmount) {
          margin-bottom: 0.5em;
        }
        :global(#root_anticipatedFundingAmountPerFiscalYear) {
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ProjectFundingAgreementFormSummary;
