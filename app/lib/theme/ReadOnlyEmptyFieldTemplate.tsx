import { FieldTemplateProps } from "@rjsf/core";

const ReadOnlyEmptyFieldTempalte: React.FC<FieldTemplateProps> = ({
  children,
}) => {
  return (
    <div>
      {children}
      <style jsx>{`
        div:not(:last-child) {
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default ReadOnlyEmptyFieldTempalte;
