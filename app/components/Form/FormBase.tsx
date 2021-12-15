import FormBorder from "components/Layout/FormBorder";
import { useEffect, useRef } from "react";
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
  // It's important to default to `undefined` when there are no errors, so that the main form knows
  // some errors may have disappeared.
  const makeErrorsObject = (errorSchema) => {
    const keys = Object.keys(formData);
    const returnVal = {};
    keys.forEach((key) => {
      if (errorSchema[key]) {
        returnVal[key] = errorSchema[key];
      } else {
        returnVal[key] = null;
      }
    });
    return returnVal;
  };

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
          onFormErrors(makeErrorsObject(change.errorSchema));
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
