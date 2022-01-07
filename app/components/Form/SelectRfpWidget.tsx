import { WidgetProps } from "@rjsf/core";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import SelectParentWidget, {
  EntitySchema,
} from "../../lib/theme/widgets/SelectParentWidget";

const SelectWidget: React.FunctionComponent<WidgetProps> = (props) => {
  const { allFundingStreams, allFundingStreamRfps } = useFragment(
    graphql`
      fragment SelectRfpWidget_query on Query {
          allFundingStreams {
            edges {
              node {
                rowId
                name
                description
              }
            }
          }
          allFundingStreamRfps {
            edges {
              node {
                rowId
                year
                fundingStreamId
              }
            }
          }
        }
    `,
    props.formContext.query
  );

  const parent: EntitySchema = useMemo(() => {
    return {
      list: query.allFundingStreams.edges.map((edge) => {
        const { rowId, name, description } = edge.node;
        return {
          rowId: rowId,
          name: name,
          description: description,
        };
      }),
      displayField: "name",
      placeholder: "Select a Funding Stream",
      label: "Funding Stream",
    };
  }, [query]);

  const child: EntitySchema = useMemo(() => {
    return {
      list: query.allFundingStreamRfps.edges.map((edge) => {
        const { rowId, year, fundingStreamId } = edge.node;
        return {
          rowId: rowId,
          year: year,
          fundingStreamId: fundingStreamId,
        };
      }),
      displayField: "year",
      placeholder: "Select a Funding Stream RFP Year",
      label: "Funding Stream RFP",
    };
  }, [query]);

  return (
    <SelectParentWidget
      {...props}
      parent={parent}
      child={child}
      foreignKey={"fundingStreamId"}
    />
  );
};

export default SelectWidget;
