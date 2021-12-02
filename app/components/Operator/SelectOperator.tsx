import React, {useState}  from "react";
import type { SelectOperator_query$key } from "__generated__/SelectOperator_query.graphql";
import { graphql, useFragment } from "react-relay";
import { Dropdown } from 'semantic-ui-react'

interface Props {
  query: SelectOperator_query$key;
  applyChange: (x: any) => void;
  formdata: any;
}

const SelectOperator: React.FC<Props> = (props) => {
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
    props.query,
  );

  const [selectedOperator, setSelectedOperator] = useState(null);
  console.log(selectedOperator);
  console.log(props);

  const getData = (e, data) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(JSON.parse(data.value))
    setSelectedOperator(JSON.parse(data.value));
    props.applyChange({'operator_id': JSON.parse(data.value).rowId});
  }

  return (
    <>
      <fieldset>
        <legend align="center">Identity</legend>
        <strong>Legal Operator Name and BC Registry ID</strong>
        <Dropdown
          placeholder='Select an Operator'
          fluid
          search
          selection
          header
          onChange={(e, data) => { getData(e, data)}}//setSelectedOperator(e.target.value)}}
          options={queryData.query.allOperators.edges.map(({node}) => {
            return {
                key: node.id,
                text: `${node.legalName} (${node.bcRegistryId})`,
                value: JSON.stringify(node)
            }
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
          },
          legend {
            color: silver;
            padding: 2px;
            align: center;
            display: block;
            align:center;
          },
          #operator-dropdown {
            color: black;
          }
        `}
      </style>
    </>
  )
};

export default SelectOperator;
