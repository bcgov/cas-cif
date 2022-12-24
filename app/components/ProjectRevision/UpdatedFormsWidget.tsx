/* eslint-disable relay/must-colocate-fragment-spreads*/
import { WidgetProps } from "@rjsf/core";
import { graphql, useFragment } from "react-relay";

import { useNumberedFormStructure } from "data/formPages/formStructure";
import CollapsibleFormWidget from "./CollapsibleFormWidget";

const updatedFormsWidgetFragment = graphql`
  fragment UpdatedFormsWidget_projectRevision on ProjectRevision {
    ...ProjectFormSummary_projectRevision
    ...ProjectContactFormSummary_projectRevision
    ...ProjectManagerFormSummary_projectRevision
    ...ProjectQuarterlyReportFormSummary_projectRevision
    ...ProjectAnnualReportFormSummary_projectRevision
    ...ProjectMilestoneReportFormSummary_projectRevision
    ...ProjectFundingAgreementFormSummary_projectRevision
    ...ProjectEmissionIntensityReportFormSummary_projectRevision
  }
`;

const UpdatedFormsWidget: React.FC<WidgetProps> = ({ formContext }) => {
  const numberedFormStructure = useNumberedFormStructure();
  const { projectRevision } = formContext;
  const query = useFragment(updatedFormsWidgetFragment, projectRevision);
  return (
    <div>
      <ol>
        {numberedFormStructure.map((form, index) => {
          const formItems = [form, ...(form.items?.map((i) => i) ?? [])].filter(
            (s) => s.formConfiguration
          );
          return (
            <CollapsibleFormWidget
              key={"collapsible-form-widget-" + index}
              title={form.title}
              formItems={formItems}
              query={query}
            />
          );
        })}
      </ol>
      <style jsx>{`
        ol {
          list-style: none;
          margin-left: 0.5em;
        }
        div :global(h3) {
          font-size: 0.9em;
          margin-top: 1.5em;
        }
        div :global(dt) {
          font-size: 0.8em;
        }
        div :global(em) {
          font-size: 0.7em;
        }
        div :global(dt:after) {
          content: ":";
        }
        div :global(label) {
          font-size: 0.8em;
        }
        div :global(.contactFormContainer > label:after) {
          content: ":";
        }
      `}</style>
    </div>
  );
};

export default UpdatedFormsWidget;
