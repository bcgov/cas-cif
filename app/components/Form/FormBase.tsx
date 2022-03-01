import Form from "lib/theme/FormWithTheme";
import { forwardRef } from "react";
import { FormProps, AjvError } from "@rjsf/core";
import { customTransformErrors } from "lib/theme/customTransformErrors";
import { customFormats, customFormatsErrorMessages } from "data/jsonSchemaForm/customFormats";

const FormBase: React.ForwardRefRenderFunction<any, FormProps<any>> = (
  props,
  ref
) => {
  console.log(props);
  console.log(ref)

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
        .errors {
          margin: 1em 0 0 0;
          padding: 20px;
          background: #ce5c5c;
          color: white;
          font-size: 20px;
        }
        :global(ul.error-detail) {
          padding: 0;
          list-style: none;
        }
        :global(li.text-danger) {
          color: #cd2026 !important;
        }
      `}</style>
    </>
  );
};

export default forwardRef(FormBase);
