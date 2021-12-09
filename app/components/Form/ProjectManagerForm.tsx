import type { JSONSchema7 } from "json-schema";
import React from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerForm_allUsers$key } from "__generated__/ProjectManagerForm_allUsers.graphql";
import FormBase from "./FormBase";
import FormComponentProps from "./FormComponentProps";

interface Props extends FormComponentProps {
  allUsers: ProjectManagerForm_allUsers$key;
}

const ProjecManagerForm: React.FunctionComponent<Props> = (props) => {
  const { allCifUsers } = useFragment(
    graphql`
      fragment ProjectManagerForm_allUsers on Query {
        allCifUsers {
          edges {
            node {
              id
              rowId
              firstName
              lastName
            }
          }
        }
      }
    `,
    props.allUsers
  );

  const uiSchema = {
    "ui:title": "Project Manager",
    project_manager: {
      "ui:col-md": 6,
      "bcgov:size": "small",
    },
  };

  const schema: JSONSchema7 = {
    type: "object",
    properties: {
      project_manager: {
        type: "number",
        title: "Project Manager",
        anyOf: allCifUsers.edges.map(({ node }) => {
          return {
            type: "number",
            title: node.firstName + " " + node.lastName,
            enum: [node.rowId],
          };
        }),
      },
    },
  };

  return <FormBase {...props} schema={schema} uiSchema={uiSchema} />;
};

export default ProjecManagerForm;
