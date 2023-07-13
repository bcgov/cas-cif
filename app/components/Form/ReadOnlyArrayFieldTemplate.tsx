import { ArrayFieldTemplateProps } from "@rjsf/core";

const ReadOnlyArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  return props.items.length === 0 ? (
    <>
      <dt style={{ margin: "0 1em 0 0" }}>{props.uiSchema.itemTitle}</dt>
      <dd style={{ marginBottom: "0px" }}>
        <em>Not added</em>
      </dd>
    </>
  ) : (
    <div>
      {props.items.map((item, i) => {
        return (
          <div key={item.key} className="itemWrapper">
            <div className="itemTitle" key={item.key}>
              {props.uiSchema.itemTitle} {i + 1}
            </div>
            <div key={item.key} className="child-wrapper">
              <div className="child">{item.children}</div>
            </div>
          </div>
        );
      })}
      <style jsx>{`
        .child-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        :global(.child) {
          flex-grow: 1;
          margin-right: 1rem;
        }
        .itemTitle {
          font-weight: bold;
          margin: 1em 0 1em 0;
        }
        . itemWrapper {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default ReadOnlyArrayFieldTemplate;
