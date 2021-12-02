import React, { useState } from "react";
import type { SelectOperator_query$key } from "__generated__/SelectOperator_query.graphql";
import { graphql, useFragment } from "react-relay";
import { Dropdown } from "semantic-ui-react";
import safeJsonParse from "lib/safeJsonParse";

interface Props {
  query: SelectOperator_query$key;
  applyChange: (x: any) => void;
  formChangeData: any;
}

const SelectOperator: React.FC<Props> = ({
  query,
  applyChange,
  formChangeData,
}) => {
  const queryData = useFragment(
    graphql`
      fragment SelectOperator_query on Query {
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

  const selectedOperator = formChangeData.operator_id
    ? queryData.query.allOperators.edges.find(
        (edge) => edge.node.rowId === formChangeData.operator_id
      ).node
    : null;

  const handleChange = (e, data) => {
    e.preventDefault();
    e.stopPropagation();
    applyChange({ operator_id: safeJsonParse(data.value).rowId });
  };

  return (
    <>
      <fieldset>
        <legend>Identity</legend>
        <strong>Legal Operator Name and BC Registry ID</strong>
        <Dropdown
          id="operator-dropdown"
          placeholder="Select an Operator"
          fluid
          search
          selection
          defaultValue={JSON.stringify(selectedOperator)}
          onChange={(e, data) => {
            handleChange(e, data);
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

export default SelectOperator;
