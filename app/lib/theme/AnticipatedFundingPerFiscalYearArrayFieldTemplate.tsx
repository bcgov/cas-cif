import { ArrayFieldTemplateProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const AnticipatedFundingPerFiscalYearArrayFieldTemplate = (
  props: ArrayFieldTemplateProps
) => {
  const { formContext } = props;

  console.log("formContext", formContext);

  const areNodesNull =
    formContext.anticipatedFundingArray.edges.filter(({ node }) => node)
      .length === 0;

  if (areNodesNull) {
    const fiscalYears = [1, 2, 3];
    return (
      <div>
        {fiscalYears.map((i) => (
          <>
            <div key={i}>
              <label
                htmlFor={`ProjectFundingAgreementForm_anticipatedFundingAmountByFiscalYear${i}`}
              >
                Anticipated Funding Amount (Fiscal Year {i})
              </label>
              <div>
                <em>
                  This field cannot be calculated due to lack of information
                  now.
                </em>
              </div>
            </div>
            <style jsx>{`
               {
                div {
                  margin-bottom: 1em;
                }
              }
            `}</style>
          </>
        ))}
      </div>
    );
  }

  return (
    <div>
      {formContext.anticipatedFundingArray.edges.map(({ node, index }) => {
        return (
          <>
            {node && node.fiscalYear && (
              <div>
                <label
                  htmlFor={`ProjectFundingAgreementForm_anticipatedFundingAmountByFiscalYear${index}`}
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
