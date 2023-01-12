import { ArrayFieldTemplateProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const AnticipatedFundingPerFiscalYearArrayFieldTemplate = (
  props: ArrayFieldTemplateProps
) => {
  const { formContext } = props;

  if (!formContext.anticipatedFundingArray) {
    return <div>No array, ask the designers what they want here</div>;
  }

  // brianna -- if there's no date sent to csnr then there's no fiscal year, and there probably won't ever be dates because it's anticipated. So should probably be using a different date
  return (
    <div>
      {formContext.anticipatedFundingArray.edges.map(({ node }) => {
        return (
          <>
            {node.fiscalYear && node.anticipatedFundingAmount && (
              <div>
                <label
                  htmlFor={`ProjectFundingAgreementForm_anticipatedFundingAmount${node.fiscalYear}`}
                >
                  Anticipated Funding Amount ({node.fiscalYear})
                </label>
                <div>
                  <NumberFormat
                    thousandSeparator={true}
                    fixedDecimalScale={true}
                    decimalScale={2}
                    prefix={"$"}
                    value={node.anticipatedFundingAmount}
                    displayType="text"
                    // This is required since we render a <span> component
                    aria-label={`Anticipated Funding Amount (${node.fiscalYear})`}
                  />
                </div>
              </div>
            )}
            {node.fiscalYear && !node.anticipatedFundingAmount && (
              <div>no amount, {node.fiscalYear}</div>
            )}
            {node.anticipatedFundingAmount && !node.fiscalYear && (
              <div>no year, {node.anticipatedFundingAmount}</div>
            )}
            <style jsx>{`
               {
                div {
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

export default AnticipatedFundingPerFiscalYearArrayFieldTemplate;
