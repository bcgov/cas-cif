import Form from "lib/theme/FormWithTheme";
import type { JSONSchema7 } from "json-schema";
import FormComponentProps from "./FormComponentProps";
interface Props extends FormComponentProps {
  schema: JSONSchema7;
  uiSchema: {};
  widgets?: any;
  formContext?: any;
}

const FormBase: React.FC<Props> = ({
  formData,
  onChange,
  schema,
  uiSchema,
  formContext,
  widgets,
  setRef,
}) => {
  return (
    <>
      <Form
        // @ts-ignore
        ref={setRef}
        noHtml5Validate
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={(change) => {
          onChange(change.formData);
        }}
        widgets={widgets}
        omitExtraData
        formContext={formContext}
      ></Form>
      <style jsx>{`
        :global(label) {
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

export default FormBase;
