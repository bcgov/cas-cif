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
      list: allFundingStreams.edges.map((edge) => {
        const { rowId, name, description } = edge.node;
        return {
          rowId: rowId,
          name: name,
          description: description,
        };
      }),
      displayField: "description",
      placeholder: "Select a Funding Stream",
      label: "Funding Stream",
    };
  }, [allFundingStreams]);

  const child: EntitySchema = useMemo(() => {
    return {
      list: allFundingStreamRfps.edges.map((edge) => {
        const { rowId, year, fundingStreamId } = edge.node;
        return {
          rowId: rowId,
          year: year,
          fundingStreamId: fundingStreamId,
        };
      }),
      displayField: "year",
      placeholder: "Select a RFP Year",
      label: "RFP Year",
    };
  }, [allFundingStreamRfps]);

  return (
    <SelectParentWidget
      {...props}
      parent={parent}
      child={child}
      foreignKey="fundingStreamId"
    />
  );
};

export default SelectWidget;
