import type { JSONSchema7 } from "json-schema";
import React from "react";
import FormBase from "../Form/FormBase";
import FormComponentProps from "../Form/FormComponentProps";
import { graphql, useFragment } from "react-relay";
import type { ProjectForm_query$key } from "__generated__/ProjectForm_query.graphql";

interface Props extends FormComponentProps {
  query: ProjectForm_query$key;
}

const ProjectForm: React.FunctionComponent<Props> = (props) => {
  const { query } = useFragment(
    graphql`
      fragment ProjectForm_query on Query {
        query {
          allOperators {
            edges {
              node {
                rowId
                legalName
                bcRegistryId
              }
            }
          }
        }
      }
    `,
    props.query
  );

  const schema: JSONSchema7 = {
    type: "object",
    required: ["rfpNumber", "description"],
    properties: {
      rfpNumber: {
        type: "string",
        title: "RFP Number",
        pattern: "^((\\d{4})-RFP-([1-2])-(\\d{3,4})-([A-Z]{4}))$",
      },
      description: { type: "string", title: "Description" },
      operator: {
        type: "number",
        title: "Operator",
        anyOf: query.allOperators.edges.map(({ node }) => {
          return {
            type: "number",
            title: `${node.legalName} (${node.bcRegistryId})`,
            enum: [node.rowId],
            value: node.rowId,
          };
        }),
      },
    },
  };

  const uiSchema = {
    rfp_number: {
      "ui:placeholder": "2020-RFP-1-456-ABCD",
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
    description: {
      "ui:placeholder": "describe the project...",
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
    operator: {
      "ui:placeholder": "Select an Operator",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:widget": "SearchWidget",
    },
  };
  return <FormBase {...props} schema={schema} uiSchema={uiSchema} />;
};

export default ProjectForm;
