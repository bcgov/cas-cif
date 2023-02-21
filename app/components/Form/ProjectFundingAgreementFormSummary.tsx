import {
  fundingParameterEPSchema,
  fundingParameterEPUiSchema,
} from "data/jsonSchemaForm/fundingParameterEPSchema";
import {
  fundingParameterIASchema,
  fundingParameterIAUiSchema,
} from "data/jsonSchemaForm/fundingParameterIASchema";
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
  expensesPaymentsTrackerEPSchema,
  expensesPaymentsTrackerEPUiSchema,
} from "data/jsonSchemaForm/expensesPaymentsTrackerEPSchema";
import {
  expensesPaymentsTrackerIASchema,
  expensesPaymentsTrackerIAUiSchema,
} from "data/jsonSchemaForm/expensesPaymentsTrackerIASchema";
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

  const {
    summaryProjectFundingAgreementFormChanges,
    isFirstRevision,
    summaryAdditionalFundingSourceFormChanges,
    totalProjectValue,
  } = revision;

  const fundingStream =
    revision.projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
      .fundingStreamByFundingStreamId.name;

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
        formSchema:
          fundingStream === "EP"
            ? fundingParameterEPSchema
            : fundingParameterIASchema,
        formData: fundingAgreementSummary?.newFormData,
      }
    : getFilteredSchema(
        fundingStream === "EP"
          ? (fundingParameterEPSchema as JSONSchema7)
          : (fundingParameterIASchema as JSONSchema7),
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
      !fundingAgreementSummary ||
      fundingAgreementSummary?.isPristine ||
      (fundingAgreementSummary?.isPristine === null &&
        Object.keys(fundingAgreementSummary?.newFormData).length === 0),
    [fundingAgreementSummary]
  );
  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () =>
      setHasDiff &&
      setHasDiff(
        !fundingAgreementFormNotUpdated ||
          !allAdditionalFundingSourceFormChangesPristine
      ),
    [
      allAdditionalFundingSourceFormChangesPristine,
      fundingAgreementFormNotUpdated,
      setHasDiff,
    ]
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
            {!isOnAmendmentsAndOtherRevisionsPage && (
              <h3>Project Additional Funding Source</h3>
            )}
            <dd>{additionalFundingSourcesJSX}</dd>
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
            schema={
              fundingStream === "EP"
                ? (expensesPaymentsTrackerEPSchema as JSONSchema7)
                : (expensesPaymentsTrackerIASchema as JSONSchema7)
            }
            uiSchema={
              fundingStream === "EP"
                ? expensesPaymentsTrackerEPUiSchema
                : expensesPaymentsTrackerIAUiSchema
            }
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
