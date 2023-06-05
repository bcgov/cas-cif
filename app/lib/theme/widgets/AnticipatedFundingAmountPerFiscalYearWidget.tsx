import { WidgetProps } from "@rjsf/core";
import { graphql, useFragment } from "react-relay";
import CalculatedValueWidget from "./CalculatedValueWidget";

const AnticipatedFundingAmountPerFiscalYearWidgetFragment = graphql`
  fragment AnticipatedFundingAmountPerFiscalYearWidget_projectRevision on ProjectRevision {
    formChangesByProjectRevisionId {
      edges {
        node {
          anticipatedFundingAmountPerFiscalYear {
            edges {
              node {
                anticipatedFundingAmount
                fiscalYear
              }
            }
          }
        }
      }
    }
  }
`;

const AnticipatedFundingAmountPerFiscalYearWidget: React.FC<WidgetProps> = (
  props
) => {
  const query = useFragment(
    AnticipatedFundingAmountPerFiscalYearWidgetFragment,
    props.formContext.projectRevision
  );

  const anticipatedFunding = query.formChangesByProjectRevisionId?.edges[0]
    ?.node.anticipatedFundingAmountPerFiscalYear?.edges[0]
    ? [
        ...query.formChangesByProjectRevisionId?.edges[0]?.node
          .anticipatedFundingAmountPerFiscalYear?.edges,
      ]
    : [];

  // This ensures that a minimum of three fiscal years are displayed, even if the user hasn't filled out any milestone information yet
  const placeholderFiscalYears = 3 - anticipatedFunding.length;
  if (anticipatedFunding.length < 3) {
    for (let i = 0; i < placeholderFiscalYears; i++) {
      anticipatedFunding.push({ node: null });
    }
  }

  return (
    <div>
      {anticipatedFunding.map(({ node }, index) => {
        const yearLabel = node?.fiscalYear ? `(${node.fiscalYear})` : "";
        return (
          <>
            <div className="anticipatedFundingAmount">
              <label htmlFor={props.id}>
                Anticipated Funding Amount Per Fiscal Year {index + 1}{" "}
                {yearLabel}
              </label>
              <CalculatedValueWidget
                {...props}
                formContext={{
                  calculatedAnticipatedFundingAmount:
                    node?.anticipatedFundingAmount,
                }}
                uiSchema={{
                  isMoney: true,
                  calculatedValueFormContextProperty:
                    "calculatedAnticipatedFundingAmount",
                }}
                label={`Anticipated Funding Amount Per Fiscal Year ${index + 1}
                ${yearLabel}`}
              />
            </div>
            <style jsx>{`
               {
                .anticipatedFundingAmount {
                  margin-bottom: 1em;
                }
              }
            `}</style>
          </>
        );
      })}
    </div>
  );
};

export default AnticipatedFundingAmountPerFiscalYearWidget;
