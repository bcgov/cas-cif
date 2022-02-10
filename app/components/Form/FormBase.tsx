import Form from "lib/theme/FormWithTheme";
import { forwardRef } from "react";
import { FormProps } from "@rjsf/core";

const FormBase: React.ForwardRefRenderFunction<any, FormProps<any>> = (
  props,
  ref
) => {
  return (
    <>
      <Form
        {...props}
        // @ts-ignore
        ref={ref}
        noHtml5Validate
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

export default forwardRef(FormBase);
