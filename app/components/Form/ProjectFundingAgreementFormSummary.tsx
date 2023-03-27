import { fundingParameterEPUiSchema } from "data/jsonSchemaForm/fundingParameterEPUiSchema";
import { fundingParameterIAUiSchema } from "data/jsonSchemaForm/fundingParameterIAUiSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import { ProjectFundingAgreementFormSummary_projectRevision$key } from "__generated__/ProjectFundingAgreementFormSummary_projectRevision.graphql";
import { useEffect, useMemo } from "react";
import React from "react";
import { calculateProponentsSharePercentage } from "lib/helpers/fundingAgreementCalculations";
import { SummaryFormProps } from "data/formPages/types";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";
import { ProjectFundingAgreementFormSummary_query$key } from "__generated__/ProjectFundingAgreementFormSummary_query.graphql";
import ReadOnlyAdditionalFundingSourcesArrayFieldTemplate from "./ReadOnlyAdditionalFundingSourcesArrayFieldTemplate";

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
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...AnticipatedFundingAmountPerFiscalYearWidget_projectRevision
        isFirstRevision
        totalProjectValue
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
              isPristine
              operation
              formChangeByPreviousFormChangeId {
                newFormData
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
            }
          }
        }
      }
    `,
    projectRevision
  );

  const {
    summaryProjectFundingAgreementFormChanges,
    isFirstRevision,
    totalProjectValue,
    latestCommittedFundingFormChanges,
  } = revision;

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

  const proponentCost =
    summaryProjectFundingAgreementFormChanges.edges[0]?.node.newFormData
      .proponentCost;

  const calculatedProponentsSharePercentage =
    calculateProponentsSharePercentage(
      proponentCost,
      Number(totalProjectValue)
    );

  // Show diff if it is not the first revision and not view only (rendered from the overview page)
  const renderDiff = !isFirstRevision && !viewOnly;

  const fundingAgreementSummary =
    summaryProjectFundingAgreementFormChanges.edges[0]?.node;

  // Set the formSchema and formData based on showing the diff or not
  const { formSchema, formData } = !renderDiff
    ? {
        formSchema: schema,
        formData: fundingAgreementSummary?.newFormData,
      }
    : getFilteredSchema(schema, fundingAgreementSummary || {});

  const fundingAgreementFormNotUpdated = useMemo(
    () =>
      !fundingAgreementSummary ||
      fundingAgreementSummary?.isPristine ||
      (fundingAgreementSummary?.isPristine === null &&
        Object.keys(fundingAgreementSummary?.newFormData).length === 0),
    [fundingAgreementSummary]
  );

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
          uiSchema={
            fundingStream === "EP"
              ? fundingParameterEPUiSchema
              : fundingParameterIAUiSchema
          }
          formData={formData}
          formContext={{
            projectRevision: revision,
            operation: fundingAgreementSummary?.operation,
            calculatedTotalProjectValue: totalProjectValue,
            calculatedProponentsSharePercentage,
            oldData:
              fundingAgreementSummary?.formChangeByPreviousFormChangeId
                ?.newFormData,
            latestCommittedData:
              latestCommittedFundingFormChanges?.edges[0]?.node.newFormData,
            isAmendmentsAndOtherRevisionsSpecific:
              isOnAmendmentsAndOtherRevisionsPage,
            calculatedEligibleExpensesToDate:
              summaryProjectFundingAgreementFormChanges.edges[0]?.node
                .eligibleExpensesToDate,
            calculatedHoldbackAmountToDate:
              summaryProjectFundingAgreementFormChanges.edges[0]?.node
                .holdbackAmountToDate,
            calculatedNetPaymentsToDate:
              summaryProjectFundingAgreementFormChanges.edges[0]?.node
                .netPaymentsToDate,
            calculatedGrossPaymentsToDate:
              summaryProjectFundingAgreementFormChanges.edges[0]?.node
                .grossPaymentsToDate,
            calculatedTotalPaymentAmountToDate:
              summaryProjectFundingAgreementFormChanges.edges[0]?.node
                .calculatedTotalPaymentAmountToDate,
          }}
          ArrayFieldTemplate={
            ReadOnlyAdditionalFundingSourcesArrayFieldTemplate
          }
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
