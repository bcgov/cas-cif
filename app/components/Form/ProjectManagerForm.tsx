import type { JSONSchema7 } from "json-schema";
import React, { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerForm_allUsers$key } from "__generated__/ProjectManagerForm_allUsers.graphql";
import FormBase from "./FormBase";
import FormComponentProps from "./FormComponentProps";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";

interface Props extends FormComponentProps {
  allUsers: ProjectManagerForm_allUsers$key;
}

const uiSchema = {
  "ui:title": "Project Manager",
  cifUserId: {
    "ui:placeholder": "Select a Project Manager",
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
  },
};

const ProjecManagerForm: React.FunctionComponent<Props> = (props) => {
  const { allCifUsers } = useFragment(
    graphql`
      fragment ProjectManagerForm_allUsers on Query {
        allCifUsers {
          edges {
            node {
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

  const schema: JSONSchema7 = useMemo(() => {
    const initialSchema = projectManagerSchema;

    initialSchema.properties.cifUserId = {
      ...initialSchema.properties.cifUserId,
      anyOf: allCifUsers.edges.map(({ node }) => {
        return {
          type: "number",
          title: `${node.firstName} ${node.lastName}`,
          enum: [node.rowId],
          value: node.rowId,
        };
      }),
    };
    return initialSchema as JSONSchema7;
  }, [allCifUsers]);

  return <FormBase {...props} schema={schema} uiSchema={uiSchema} />;
};

export default ProjecManagerForm;
