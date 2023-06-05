import { ArrayFieldTemplateProps } from "@rjsf/core";
import CalculatedValueWidget from "lib/theme/widgets/CalculatedValueWidget";

const ReadOnlyAnticipatedFundingPerFiscalYearArrayFieldTemplate = (
  props: ArrayFieldTemplateProps
) => {
  console.log("props.items", props.items);
  return (
    <>
      {props.items.map((item, i) => {
        //   can i map item.children? did I try that already?

        return (
          <div key={item.key} className="additionalFundingSourceWithNumber">
            <div className="sourceTitle">
              Anticipated Funding Amount Fiscal Year {i + 1}
            </div>
            <div key={item.key} className="additionalFundingSourceSection">
              <div className="additionalFundingSourceForm">{item.children}</div>
            </div>
          </div>
        );
      })}
      <style jsx>{`
        .additionalFundingSourceSection {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        :global(.additionalFundingSourceForm) {
          flex-grow: 1;
          margin-right: 1rem;
        }
        .sourceTitle {
          font-weight: bold;
          margin: 1em 0 1em 0;
        }
        . additionalFundingSourceWithNumber {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </>
  );
};

export default ReadOnlyAnticipatedFundingPerFiscalYearArrayFieldTemplate;
