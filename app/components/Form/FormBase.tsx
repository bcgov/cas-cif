import Form from "lib/theme/FormWithTheme";
import type { JSONSchema7 } from "json-schema";
import FormComponentProps from "./FormComponentProps";
import { forwardRef } from "react";
interface Props extends FormComponentProps {
  schema: JSONSchema7;
  uiSchema: {};
  widgets?: any;
  formContext?: any;
}

const FormBase: React.ForwardRefRenderFunction<any, Props> = (
  { formData, onChange, schema, uiSchema, formContext, widgets },
  ref
) => {
  return (
    <>
      <Form
        // @ts-ignore
        ref={ref}
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

export default forwardRef(FormBase);
