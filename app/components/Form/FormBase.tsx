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
        :global(.diffOld) {
          background-color: #fad980;
        }
        :global(.diffNew) {
          background-color: #94bfa2;
        }
        :global(.diff-arrow) {
          margin-left: 10px;
          margin-right: 10px;
        }
      `}</style>
    </>
  );
};

export default forwardRef(FormBase);
