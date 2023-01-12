import { ArrayFieldTemplateProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const AnticipatedFundingPerFiscalYearArrayFieldTemplate = (
  props: ArrayFieldTemplateProps
) => {
  const { formContext, formData } = props;
  console.log("formdata", formData);

  if (!formContext.anticipatedFundingArray) {
    return <div>No array, ask the designers what they want here</div>;
  }

  return (
    <div>
      {formContext.anticipatedFundingArray.edges.map(({ node }) => {
        console.log("node", node);
        return (
          <>
            {node && node.fiscalYear && (
              <div>
                <label
                  htmlFor={`ProjectFundingAgreementForm_anticipatedFundingAmount${node.fiscalYear}`}
                >
                  Anticipated Funding Amount (Fiscal Year {node.fiscalYear})
                </label>
                {node.anticipatedFundingAmount ? (
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
                ) : (
                  <div>
                    <em>
                      This field cannot be calculated due to lack of information
                      now.
                    </em>
                  </div>
                )}
              </div>
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
