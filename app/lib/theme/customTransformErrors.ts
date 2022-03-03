import { AjvError } from "@rjsf/core";

export const customTransformErrors = (
  errors: AjvError[],
  customFormatsErrorMessages: { [key: string]: string }
) => {
  // Ignore oneOf errors https://github.com/rjsf-team/react-jsonschema-form/issues/1263
  return errors
    .filter((error) => error.name !== "oneOf")
    .map((error) => {
      if (!["format", "required"].includes(error.name)) return error;
      if (error.name === "required")
        return {
          ...error,
          message: `Please enter a value`,
        };
      if (customFormatsErrorMessages[error.params.format])
        return {
          ...error,
          message: customFormatsErrorMessages[error.params.format],
        };
      return error;
    });
};
