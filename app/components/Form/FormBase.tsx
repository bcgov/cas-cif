import formTheme from "lib/theme/FormWithTheme";
import { forwardRef, useMemo } from "react";
import { FormProps, AjvError, withTheme } from "@rjsf/core";
import { customTransformErrors } from "lib/theme/customTransformErrors";
import {
  customFormats,
  customFormatsErrorMessages,
} from "data/jsonSchemaForm/customFormats";

interface FormPropsWithTheme<T> extends FormProps<T> {
  theme?: any;
}

const FormBase: React.ForwardRefRenderFunction<any, FormPropsWithTheme<any>> = (
  props,
  ref
) => {
  const Form = useMemo(
    () => withTheme(props.theme ?? formTheme),
    [props.theme]
  );
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
        tagName={props.tagName}
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
