import formTheme from "lib/theme/FormWithTheme";
import { FormEvent, forwardRef, useEffect, useMemo, useState } from "react";
import { FormProps, AjvError, withTheme, ISubmitEvent } from "@rjsf/core";
import validateFormData from "@rjsf/core/dist/cjs/validate";
import { customTransformErrors } from "lib/theme/customTransformErrors";
import {
  customFormats,
  customFormatsErrorMessages,
} from "data/jsonSchemaForm/customFormats";

interface FormPropsWithTheme<T> extends FormProps<T> {
  theme?: any;
  validateOnMount?: boolean;
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

  const [extraErrors, setExtraErrors] = useState<any>(null);
  useEffect(() => {
    if (props.validateOnMount) {
      setExtraErrors(
        validateFormData(
          props.formData,
          props.schema,
          props.validate,
          transformErrors
        ).errorSchema
      );
    }
    // only run the effect on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (
    e: ISubmitEvent<any>,
    nativeEvent: FormEvent<HTMLFormElement>
  ) => {
    setExtraErrors(() => null);
    props.onSubmit?.(e, nativeEvent);
  };

  const handleError = (e: any) => {
    setExtraErrors(() => null);
    props.onError?.(e);
  };

  return (
    <>
      <Form
        {...props}
        // @ts-ignore
        ref={ref}
        extraErrors={extraErrors}
        customFormats={customFormats}
        transformErrors={transformErrors}
        noHtml5Validate
        omitExtraData
        showErrorList={false}
        tagName={props.tagName}
        onSubmit={handleSubmit}
        onError={handleError}
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
        :global(.revisionDiffOld) {
          color: #ee0004;
          text-decoration: line-through;
          font-size: 0.7em;
        }
        :global(.revisionDiffNew) {
          font-size: 0.7em;
        }
      `}</style>
    </>
  );
};

export default forwardRef(FormBase);
