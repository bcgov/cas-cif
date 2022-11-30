import { AjvError } from "@rjsf/core";

export const customTransformErrors = (
  errors: AjvError[],
  customFormatsErrorMessages: { [key: string]: string }
) => {
  // Ignore oneOf errors https://github.com/rjsf-team/react-jsonschema-form/issues/1263
  return errors
    .filter((error) => error.name !== "oneOf")
    .map((error) => {
      if (!["format", "required", "pattern"].includes(error.name)) return error;
      if (error.name === "required")
        return {
          ...error,
          message: `Please enter a value`,
        };
      if (
        error.name === "pattern" &&
        // substring is necessary here as the properties include a "." prefix. eg. the property for the email field is ".email"
        customFormatsErrorMessages[error.property.substring(1)]
      ) {
        return {
          ...error,
          message: customFormatsErrorMessages[error.property.substring(1)],
        };
      }
      if (customFormatsErrorMessages[error.params.format])
        return {
          ...error,
          message: customFormatsErrorMessages[error.params.format],
        };
      return error;
    });
};
