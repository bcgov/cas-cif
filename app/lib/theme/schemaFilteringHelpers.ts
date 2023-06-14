import type { JSONSchema7 } from "json-schema";

// The two functions below filter out fields from the formSchema that have not changed from the previous revision so the summary ignores these fields
// This is mainly used when the form has multiple fields within it and we want to check each field data with the previous revision

// `getSchemaAndDataIncludingCalculatedValues` can be used to get the schema and filtered data for any form
export const getSchemaAndDataIncludingCalculatedValues = (
  formSchema: JSONSchema7,
  formDataIncludingCalculatedValues,
  oldFormDataIncludingCalculatedValues,
  additionalSchemaProperties = {}
) => {
  const filteredSchema = {
    ...JSON.parse(JSON.stringify(formSchema)),
    properties: {
      ...JSON.parse(JSON.stringify(formSchema)).properties,
      ...additionalSchemaProperties,
    },
  };

  const newDataObject = {};

  for (const key of Object.keys(filteredSchema.properties)) {
    if (
      formDataIncludingCalculatedValues?.[key] ===
      oldFormDataIncludingCalculatedValues?.[key]
    )
      delete filteredSchema.properties[key];
    else newDataObject[key] = formDataIncludingCalculatedValues?.[key];
  }

  return {
    formSchema: filteredSchema,
    formData: newDataObject,
  };
};

// `getFilteredSchema` can only be used when all form values are found in `newFormData` (most of the time, calculated values are queried outside of `newFormData`, so in forms with calculated values, use `getSchemaAndDataIncludingCalculatedValues` instead)
export const getFilteredSchema = (formSchema: JSONSchema7, formChange) => {
  const filteredSchema = JSON.parse(JSON.stringify(formSchema));
  const newDataObject = {};

  for (const key of Object.keys(filteredSchema.properties)) {
    if (
      formChange?.newFormData?.[key] ===
      formChange?.formChangeByPreviousFormChangeId?.newFormData?.[key]
    )
      delete filteredSchema.properties[key];
    else newDataObject[key] = formChange.newFormData?.[key];
  }

  return { formSchema: filteredSchema, formData: newDataObject };
};
