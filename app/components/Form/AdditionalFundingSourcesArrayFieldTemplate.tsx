import Button from "@button-inc/bcgov-theme/Button";
import { ArrayFieldTemplateProps } from "@rjsf/core";
import FormBorder from "../../lib/theme/components/FormBorder";

const AdditionalFundingSourcesArrayFieldTemplate = (
  props: ArrayFieldTemplateProps
) => {
  return (
    <>
      <FormBorder title={"Additional Funding Sources"}>
        {props.items.map((item, i: number) => {
          return (
            <>
              <div className="sourceTitle">
                Additional Funding Source {i + 1}
              </div>
              <div key={item.key} className="additionalFundingSourceSection">
                <div className="additionalFundingSourceForm">
                  {item.children}
                </div>

                {i >= 0 && (
                  <Button
                    onClick={item.onDropIndexClick(item.index)}
                    className="removeButton"
                    variant="secondary"
                    size="small"
                  >
                    {"Remove"}
                  </Button>
                )}
              </div>
            </>
          );
        })}

        {props.canAdd && (
          <Button onClick={props.onAddClick} variant="secondary">
            {"Add Funding Source"}
          </Button>
        )}
      </FormBorder>
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
        div :global(button.removeButton) {
          margin-top: -19.5em;
        }
        .sourceTitle {
          font-weight: bold;
          margin: 1em 0 1em 0;
        }
      `}</style>
    </>
  );
};

export default AdditionalFundingSourcesArrayFieldTemplate;
