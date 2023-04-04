import { ArrayFieldTemplateProps } from "@rjsf/core";

const ReadOnlyAdditionalFundingSourcesArrayFieldTemplate = (
  props: ArrayFieldTemplateProps
) => {
  return (
    <>
      {props.items.map((item, i) => {
        return (
          <div key={item.key} className="additionalFundingSourceWithNumber">
            <div className="sourceTitle">Additional Funding Source {i + 1}</div>
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

export default ReadOnlyAdditionalFundingSourcesArrayFieldTemplate;
