import React from "react";
import type { Identity_query$key } from "__generated__/Identity_query.graphql";
import { graphql, useFragment } from "react-relay";
import { Dropdown } from "semantic-ui-react";
import safeJsonParse from "lib/safeJsonParse";
import Form from "lib/theme/service-development-toolkit-form";
import { JSONSchema7 } from "json-schema";

interface Props {
  query: Identity_query$key;
  applyChange: (x: any) => void;
  formChangeData: any;
}

const schema: JSONSchema7 = {
  type: "object",
  properties: {
    project_name: { type: "string", title: "" },
  },
};

const uiSchema = {
  project_name: {
    "ui:placeholder": "2020-RFP-1-456-ABCD",
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
};

const Identity: React.FC<Props> = ({ query, applyChange, formChangeData }) => {
  const queryData = useFragment(
    graphql`
      fragment Identity_query on Query {
        query {
          allOperators {
            edges {
              node {
                id
                rowId
                legalName
                tradeName
                bcRegistryId
              }
            }
          }
        }
      }
    `,
    query
  );

  // Override submit button for form with an empty fragment
  // eslint-disable-next-line react/jsx-no-useless-fragment
  const buttonOverride = <></>;

  const selectedOperator = formChangeData.operator_id
    ? queryData.query.allOperators.edges.find(
        (edge) => edge.node.rowId === formChangeData.operator_id
      ).node
    : null;

  const handleDropdownChange = (e, data) => {
    e.preventDefault();
    e.stopPropagation();
    applyChange({ operator_id: safeJsonParse(data.value).rowId });
  };

  const onValueChanged = async (change) => {
    const { formData } = change;
    applyChange({ project_name: formData.project_name });
  };

  return (
    <>
      <fieldset>
        <legend>Identity</legend>
        <strong>Project Name</strong>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formChangeData}
          onChange={onValueChanged}
        >
          {buttonOverride}
        </Form>
        <strong>Legal Operator Name and BC Registry ID</strong>
        <Dropdown
          id="operator-dropdown"
          placeholder="Select an Operator"
          fluid
          search
          selection
          defaultValue={JSON.stringify(selectedOperator)}
          onChange={(e, data) => {
            handleDropdownChange(e, data);
          }}
          options={queryData.query.allOperators.edges.map(({ node }) => {
            return {
              key: node.id,
              text: `${node.legalName} (${node.bcRegistryId})`,
              value: JSON.stringify(node),
            };
          })}
        />
        <strong>Trade Name</strong>
        {selectedOperator?.tradeName}
      </fieldset>
      <style jsx>
        {`
          .pg-input-label {
            display: none;
          }
          strong {
            font-size: 1.2em;
            margin-bottom: 1em;
            margin-top: 1em;
          }
          fieldset {
            padding: 2em;
            border: 2px solid silver;
          }
          ,
          legend {
            color: silver;
            padding: 2px;
            align: center;
            display: block;
            text-align: center;
            font-size: 1.2em;
          }
          ,
          #operator-dropdown {
            text-align: left;
            color: black;
          }
        `}
      </style>
    </>
  );
};

export default Identity;
