import FormBorder from "components/Layout/FormBorder";
import { useRef } from "react";
import Form from "lib/theme/service-development-toolkit-form";
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
  const formRef = useRef();

  return (
    <FormBorder title={schema.title}>
      <Form
        // @ts-ignore
        ref={formRef}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={(change) => {
          onChange(change.formData);
          onFormErrors(change.errors);
        }}
        liveValidate
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
