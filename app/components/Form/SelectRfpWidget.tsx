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

  const isInternal = props.formContext.isInternal;

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

  const formattedAllFundingStreamRfps = allFundingStreamRfps.edges.map(
    (edge) => {
      const { rowId, year, fundingStreamId } = edge.node;
      return {
        rowId: rowId,
        year: year,
        fundingStreamId: fundingStreamId,
      };
    }
  );

  const currentYearFundingStreamRfps = formattedAllFundingStreamRfps.filter(
    (stream) => stream.year === new Date().getFullYear()
  );

  const child: EntitySchema = useMemo(() => {
    return {
      list: isInternal
        ? formattedAllFundingStreamRfps
        : currentYearFundingStreamRfps,
      displayField: "year",
      placeholder: "Select a RFP Year",
      label: "RFP Year",
    };
  }, [currentYearFundingStreamRfps, formattedAllFundingStreamRfps, isInternal]);

  return (
    <SelectParentWidget
      {...props}
      parent={parent}
      child={child}
      foreignKey="fundingStreamId"
      isInternal={isInternal}
    />
  );
};

export default SelectWidget;
