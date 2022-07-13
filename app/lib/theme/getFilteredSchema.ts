import type { JSONSchema7 } from "json-schema";

// Filter out fields from the formSchema that have not changed from the previous revision so the summary ignores these fields
// This is mainly used when the form has multiple fields within it and we want to check each field data with the previous revision
export const getFilteredSchema = (formSchema: JSONSchema7, formData) => {
  const filteredSchema = JSON.parse(JSON.stringify(formSchema));
  const newDataObject = {};

  for (const key of Object.keys(filteredSchema.properties)) {
    if (
      formData?.newFormData?.[key] ===
      formData?.formChangeByPreviousFormChangeId?.newFormData?.[key]
    )
      delete filteredSchema.properties[key];
    else newDataObject[key] = formData.newFormData?.[key];
  }

  return { formSchema: filteredSchema, formData: newDataObject };
};
