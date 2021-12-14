import type { JSONSchema7 } from "json-schema";
import React, { useMemo } from "react";
import FormBase from "../Form/FormBase";
import FormComponentProps from "../Form/FormComponentProps";
import { ProjectFundingStreamForm_query } from "__generated__/ProjectFundingStreamForm_query.graphql";
import { graphql } from "react-relay/hooks";
import { createFragmentContainer } from "react-relay";

interface Props extends FormComponentProps {
  query: ProjectFundingStreamForm_query;
}

export const ProjectFundingStreamForm: React.FunctionComponent<Props> = (
  props
) => {
  const fundingStreams = useMemo(
    () => props.query.fundingStreams.edges.map((edge) => edge.node),
    [props.query.fundingStreams]
  );

  const uiSchema = {
    title: "Funding Stream",
    funding_stream_id: {
      "ui:placeholder": "Select a Funding Stream",
      "ui:widget": "select",
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
  };

  var schema: JSONSchema7 = {
    type: "object",
    title: "Project Funding Stream",
    properties: {
      funding_stream_id: {
        type: "integer",
        title: "Funding Stream ID",
        anyOf: fundingStreams.map((node) => {
          return {
            type: "number",
            title: node.name,
            enum: [node.rowId],
          };
        }),
      },
    },
  };

  return <FormBase {...props} schema={schema} uiSchema={uiSchema} />;
};

export default createFragmentContainer(ProjectFundingStreamForm, {
  query: graphql`
    fragment ProjectFundingStreamForm_query on Query {
      fundingStreams: allFundingStreams {
        edges {
          node {
            id
            rowId
            name
            description
          }
        }
      }
    }
  `,
});
