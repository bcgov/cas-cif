import React, {useState}  from "react";
import type { SelectOperator_query$key } from "__generated__/SelectOperator_query.graphql";
import { graphql, useFragment } from "react-relay";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";

interface Props {
  query: SelectOperator_query$key;
}

const SelectOperator: React.FC<Props> = (props) => {
  const data = useFragment(
    graphql`
      fragment SelectOperator_query on Query {
        query {
          allOperators {
          edges {
            node {
              id
              legalName
            }
          }
        }
        }
      }
    `,
    props.query,
  );

  const [selectedOperator, setSelectedOperator] = useState(null);

  return (
    <Dropdown
      id="operator-dropdown"
      label="Select an operator"
      name="operator"
      rounded
      size="medium"
      defaultValue={null}
      onChange={(e) => {setSelectedOperator(e.target.value)}}
    >
      <option value={null}></option>
      {data.query.allOperators.edges.map(({ node }) => (
        <option key={node.id} value={node.id} >
          {node.legalName}
        </option>
      ))}
    </Dropdown>
  )
};

export default SelectOperator;
