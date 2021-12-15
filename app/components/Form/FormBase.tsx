import { useRef } from "react";
import Form from "lib/theme/service-development-toolkit-form";
import type { JSONSchema7 } from "json-schema";
import FormComponentProps from "./FormComponentProps";
import FormBorder from "lib/theme/components/FormBorder";
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
  const formRef = useRef();

  return (
    <FormBorder title={schema.title}>
      <Form
        noHtml5Validate
        // @ts-ignore
        ref={formRef}
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
    </FormBorder>
  );
};

export default FormBase;
