import { WidgetProps } from "@rjsf/core";
import { graphql, useFragment } from "react-relay";

import { useNumberedFormStructure } from "data/formPages/formStructure";
import CollapsibleFormWidget from "./CollapsibleFormWidget";

const UpdatedFormsWidget: React.FC<WidgetProps> = ({ formContext }) => {
  const { projectFormChange } = useFragment(
    // eslint-disable-next-line relay/graphql-syntax
    graphql`
      fragment UpdatedFormsWidget_projectRevision on ProjectRevision {
        projectFormChange {
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                name
              }
            }
          }
        }
      }
    `,
    formContext.projectRevision
  );

  const fundingStream =
    projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
      .fundingStreamByFundingStreamId.name;
  const numberedFormStructure = useNumberedFormStructure(fundingStream);

  return (
    <div>
      <ol>
        {numberedFormStructure.map((form, index) => {
          /**
           * A section has form configuration items that need to be rendered,
           * A section can also have its own form configuration to render
           */
          const formItems = [form, ...(form.items?.map((i) => i) ?? [])].filter(
            (s) => s.formConfiguration
          );
          return (
            <CollapsibleFormWidget
              key={"collapsible-form-widget-" + index}
              title={form.title}
              formItems={formItems}
              projectRevision={formContext.projectRevision}
              query={formContext.query}
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
