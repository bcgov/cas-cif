import {
  fundingAgreementSchema,
  fundingAgreementUiSchema,
} from "data/jsonSchemaForm/fundingAgreementSchema";
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
import additionalFundingSourceSchema from "data/jsonSchemaForm/additionalFundingSourceSchema";
import { createAdditionalFundingSourceUiSchema } from "./ProjectFundingAgreementForm";
import {
  expensesPaymentsTrackerSchema,
  expensesPaymentsTrackerUiSchema,
} from "data/jsonSchemaForm/expensesPaymentsTrackerSchema";
import { calculateProponentsSharePercentage } from "lib/helpers/fundingAgreementCalculations";
import { SummaryFormProps } from "data/formPages/types";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";

const { fields } = utils.getDefaultRegistry();

// Set custom rjsf fields to display diffs
const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props
  extends SummaryFormProps<ProjectFundingAgreementFormSummary_projectRevision$key> {}

const ProjectFundingAgreementFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
  const {
    summaryProjectFundingAgreementFormChanges,
    isFirstRevision,
    summaryAdditionalFundingSourceFormChanges,
    totalProjectValue,
    anticipatedFundingAmountPerFiscalYear,
  } = useFragment(
    graphql`
      fragment ProjectFundingAgreementFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
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
              isPristine
              operation
              formChangeByPreviousFormChangeId {
                newFormData
              }
            }
          }
        }
        summaryAdditionalFundingSourceFormChanges: formChangesFor(
          formDataTableName: "additional_funding_source"
        ) {
          edges {
            node {
              id
              isPristine
              newFormData
              operation
              formChangeByPreviousFormChangeId {
                newFormData
              }
            }
          }
        }
      }
    `,
    projectRevision
  );

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

  let additionalFundingSourceFormChanges =
    summaryAdditionalFundingSourceFormChanges.edges;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived contacts
  if (!renderDiff)
    additionalFundingSourceFormChanges =
      summaryAdditionalFundingSourceFormChanges.edges.filter(
        ({ node }) => node.operation !== "ARCHIVE"
      );

  const sortedAdditionalFundingSourceFormChanges = useMemo(() => {
    const additionalFundingSourceForms = [
      ...additionalFundingSourceFormChanges.map((node) => node),
    ];
    additionalFundingSourceForms.sort(
      (a, b) => a.node.newFormData.sourceIndex - b.node.newFormData.sourceIndex
    );
    return additionalFundingSourceForms;
  }, [additionalFundingSourceFormChanges]);

  // Set the formSchema and formData based on showing the diff or not
  const { formSchema, formData } = !renderDiff
    ? {
        formSchema: fundingAgreementSchema,
        formData: fundingAgreementSummary?.newFormData,
      }
    : getFilteredSchema(
        fundingAgreementSchema as JSONSchema7,
        fundingAgreementSummary || {}
      );

  const allAdditionalFundingSourceFormChangesPristine = useMemo(
    () =>
      !sortedAdditionalFundingSourceFormChanges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [sortedAdditionalFundingSourceFormChanges]
  );

  const additionalFundingSourcesJSX = useMemo(() => {
    return sortedAdditionalFundingSourceFormChanges.map(({ node }, index) => {
      // Set the formSchema and formData based on showing the diff or not
      const additionalFundingSourceDiffObject = !renderDiff
        ? {
            formSchema: additionalFundingSourceSchema,
            formData: node.newFormData,
          }
        : getFilteredSchema(additionalFundingSourceSchema as JSONSchema7, node);

      return (
        <div key={node.id}>
          {Object.keys(additionalFundingSourceDiffObject.formSchema.properties)
            .length === 0 &&
            node.operation !== "ARCHIVE" &&
            !isOnAmendmentsAndOtherRevisionsPage && (
              <em>Additional funding source {index + 1} not updated</em>
            )}
          {renderDiff && node.operation === "ARCHIVE" ? (
            !isOnAmendmentsAndOtherRevisionsPage ? (
              <FormRemoved
                isOnAmendmentsAndOtherRevisionsPage={
                  isOnAmendmentsAndOtherRevisionsPage
                }
                formTitle={`Additional funding source ${index + 1}`}
              />
            ) : (
              <em className="diffAmendmentsAndOtherRevisionsOld">
                Additional funding source {index + 1}
              </em>
            )
          ) : (
            <FormBase
              liveValidate
              tagName={"dl"}
              fields={renderDiff ? customFields : fields}
              theme={readOnlyTheme}
              schema={
                additionalFundingSourceDiffObject.formSchema as JSONSchema7
              }
              uiSchema={createAdditionalFundingSourceUiSchema(index + 1)}
              formData={additionalFundingSourceDiffObject.formData}
              formContext={{
                operation: node.operation,
                oldData: node.formChangeByPreviousFormChangeId?.newFormData,
                isAmendmentsAndOtherRevisionsSpecific:
                  isOnAmendmentsAndOtherRevisionsPage,
              }}
            />
          )}
        </div>
      );
    });
  }, [
    sortedAdditionalFundingSourceFormChanges,
    renderDiff,
    isOnAmendmentsAndOtherRevisionsPage,
  ]);

  const fundingAgreementFormNotUpdated = useMemo(
    () =>
      (!fundingAgreementSummary ||
        fundingAgreementSummary?.isPristine ||
        (fundingAgreementSummary?.isPristine === null &&
          Object.keys(fundingAgreementSummary?.newFormData).length === 0)) &&
      allAdditionalFundingSourceFormChangesPristine,
    [allAdditionalFundingSourceFormChangesPristine, fundingAgreementSummary]
  );
  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!fundingAgreementFormNotUpdated),
    [fundingAgreementFormNotUpdated, setHasDiff]
  );

  if (
    isOnAmendmentsAndOtherRevisionsPage &&
    !fundingAgreementFormNotUpdated &&
    fundingAgreementSummary?.operation === "ARCHIVE"
  ) {
    return (
      <FormRemoved
        isOnAmendmentsAndOtherRevisionsPage={
          isOnAmendmentsAndOtherRevisionsPage
        }
        formTitle="Budgets, Expenses & Payments"
      />
    );
  }

  return (
    <div className="summaryContainer">
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
          uiSchema={fundingAgreementUiSchema}
          formData={formData}
          formContext={{
            operation: fundingAgreementSummary?.operation,
            calculatedTotalProjectValue: totalProjectValue,
            calculatedProponentsSharePercentage,
            oldData:
              fundingAgreementSummary?.formChangeByPreviousFormChangeId
                ?.newFormData,
            isAmendmentsAndOtherRevisionsSpecific:
              isOnAmendmentsAndOtherRevisionsPage,
          }}
        />
      )}
      {!isOnAmendmentsAndOtherRevisionsPage && (
        <h3>Project Additional Funding Source</h3>
      )}
      {sortedAdditionalFundingSourceFormChanges.length < 1 && viewOnly && (
        <FormNotAddedOrUpdated
          isFirstRevision={true} //setting this to true so that the text is "Additional Funding Source not added"
          formTitle="Additional Funding Source"
        />
      )}
      {(allAdditionalFundingSourceFormChangesPristine ||
        sortedAdditionalFundingSourceFormChanges.length < 1) &&
      !viewOnly
        ? !isOnAmendmentsAndOtherRevisionsPage && (
            <FormNotAddedOrUpdated
              isFirstRevision={isFirstRevision}
              formTitle="Additional Funding Source"
            />
          )
        : additionalFundingSourcesJSX}

      {viewOnly && !isOnAmendmentsAndOtherRevisionsPage && (
        <>
          <h3>Expenses & Payments Tracker</h3>
          <FormBase
            tagName={"dl"}
            theme={readOnlyTheme}
            fields={renderDiff ? customFields : fields}
            schema={expensesPaymentsTrackerSchema as JSONSchema7}
            uiSchema={expensesPaymentsTrackerUiSchema}
            formData={formData}
            formContext={{
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
              operation: fundingAgreementSummary?.operation,
              oldData:
                fundingAgreementSummary?.formChangeByPreviousFormChangeId
                  ?.newFormData,
            }}
          />
        </>
      )}
      <style jsx>{`
        .summaryContainer {
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
};

export default ProjectFundingAgreementFormSummary;
