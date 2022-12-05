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
import { useMemo } from "react";
import React from "react";
import additionalFundingSourceSchema from "data/jsonSchemaForm/additionalFundingSourceSchema";
import { createAdditionalFundingSourceUiSchema } from "./ProjectFundingAgreementForm";

const { fields } = utils.getDefaultRegistry();

// Set custom rjsf fields to display diffs
const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectFundingAgreementFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectFundingAgreementFormSummary: React.FC<Props> = (props) => {
  const {
    summaryProjectFundingAgreementFormChanges,
    isFirstRevision,
    summaryAdditionalFundingSourceFormChanges,
    totalProjectValue,
  } = useFragment(
    graphql`
      fragment ProjectFundingAgreementFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        totalProjectValue
        summaryProjectFundingAgreementFormChanges: formChangesFor(
          formDataTableName: "funding_parameter"
        ) {
          edges {
            node {
              newFormData
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
    props.projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the overview page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

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
            node.operation !== "ARCHIVE" && (
              <em>Additional funding source {index + 1} not updated</em>
            )}
          {renderDiff && node.operation === "ARCHIVE" ? (
            <em className="diffOld">
              Additional funding source {index + 1} removed
            </em>
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
              }}
            />
          )}
        </div>
      );
    });
  }, [sortedAdditionalFundingSourceFormChanges, renderDiff]);

  return (
    <div className="summaryContainer">
      <h3>Budgets, Expenses & Payments</h3>
      {(!fundingAgreementSummary ||
        fundingAgreementSummary?.isPristine ||
        (fundingAgreementSummary?.isPristine === null &&
          Object.keys(fundingAgreementSummary?.newFormData).length === 0)) &&
      !props.viewOnly ? (
        <p>
          <em>
            Budgets, Expenses & Payments not{" "}
            {isFirstRevision ? "added" : "updated"}
          </em>
        </p>
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
            oldData:
              fundingAgreementSummary?.formChangeByPreviousFormChangeId
                ?.newFormData,
          }}
        />
      )}
      <h3>Project Additional Funding Source</h3>
      {sortedAdditionalFundingSourceFormChanges.length < 1 && props.viewOnly && (
        <dd>
          <em>No Additional Funding Source</em>
        </dd>
      )}
      {(allAdditionalFundingSourceFormChangesPristine ||
        sortedAdditionalFundingSourceFormChanges.length < 1) &&
      !props.viewOnly ? (
        <dd>
          <em>
            Additional Funding Source not{" "}
            {isFirstRevision ? "added" : "updated"}
          </em>
        </dd>
      ) : (
        additionalFundingSourcesJSX
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
