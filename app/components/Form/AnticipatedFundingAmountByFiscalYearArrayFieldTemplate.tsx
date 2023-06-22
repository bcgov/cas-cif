import { ArrayFieldTemplateProps } from "@rjsf/core";
import CalculatedValueWidget from "lib/theme/widgets/CalculatedValueWidget";

const AnticipatedFundingAmountByFiscalYearArrayFieldTemplate = (
  props: ArrayFieldTemplateProps
) => {
  const anticipatedFunding = props.formContext
    .anticipatedFundingAmountPerFiscalYear?.edges
    ? [...props.formContext.anticipatedFundingAmountPerFiscalYear?.edges]
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
        let id = props.idSchema.$id + (index + 1);
        return (
          <>
            <div className="anticipatedFundingAmount">
              <label htmlFor={id}>
                Anticipated Funding Amount Per Fiscal Year {index + 1}{" "}
                {yearLabel}
              </label>
              <CalculatedValueWidget
                id={id}
                value={undefined}
                autofocus={false}
                placeholder={""}
                onChange={() => {}}
                options={{}}
                onBlur={() => {}}
                onFocus={() => {}}
                multiple={false}
                rawErrors={[]}
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

export default AnticipatedFundingAmountByFiscalYearArrayFieldTemplate;
