import Form from "lib/theme/FormWithTheme";
import { forwardRef } from "react";
import { FormProps, AjvError } from "@rjsf/core";
import { customTransformErrors } from "lib/theme/customTransformErrors";
import {
  customFormats,
  customFormatsErrorMessages,
} from "data/jsonSchemaForm/customFormats";

const FormBase: React.ForwardRefRenderFunction<any, FormProps<any>> = (
  props,
  ref
) => {
  const transformErrors = (errors: AjvError[]) => {
    return customTransformErrors(errors, customFormatsErrorMessages);
  };
  return (
    <>
      <Form
        {...props}
        // @ts-ignore
        ref={ref}
        customFormats={customFormats}
        transformErrors={transformErrors}
        noHtml5Validate
        omitExtraData
        showErrorList={false}
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
