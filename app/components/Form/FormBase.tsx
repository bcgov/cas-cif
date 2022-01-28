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

const FormBase: React.ForwardRefRenderFunction<any, Props> = (props, ref) => {
  const { onChange } = props;

  return (
    <>
      <Form
        {...props}
        // @ts-ignore
        ref={ref}
        noHtml5Validate
        omitExtraData
        onChange={(change) => {
          onChange(change.formData);
        }}
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
