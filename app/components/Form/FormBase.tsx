import Form from "lib/theme/FormWithTheme";
import type { JSONSchema7 } from "json-schema";
import FormComponentProps from "./FormComponentProps";
interface Props extends FormComponentProps {
  schema: JSONSchema7;
  uiSchema: {};
}

const FormBase: React.FC<Props> = ({
  formData,
  onChange,
  onFormErrors,
  schema,
  uiSchema,
}) => {
  return (
    <>
      <Form
        noHtml5Validate
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={(change) => {
          onChange(change.formData);
          onFormErrors(change.errors);
        }}
        omitExtraData
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
