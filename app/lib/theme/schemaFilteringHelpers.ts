import type { JSONSchema7 } from "json-schema";
import { isEqual } from "lodash";

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
    // null new data with undefined old data occurs when an optional form (e.g. budgets) is created but not filled

    if (
      formDataIncludingCalculatedValues?.[key] === null &&
      oldFormDataIncludingCalculatedValues?.[key] === undefined
    ) {
      delete filteredSchema.properties[key];
    } else if (
      isEqual(
        formDataIncludingCalculatedValues?.[key],
        oldFormDataIncludingCalculatedValues?.[key]
      )
    ) {
      delete filteredSchema.properties[key];
    } else newDataObject[key] = formDataIncludingCalculatedValues?.[key];
  }

  return {
    formSchema: filteredSchema,
    formData: newDataObject,
  };
};

// `getFilteredSchema` can only be used when all form values are found in `newFormData` (most of the time, calculated values are queried outside of `newFormData`, so in forms with calculated values, use `getSchemaAndDataIncludingCalculatedValues` instead)
export const getFilteredSchema = (
  formSchema: JSONSchema7,
  formChange,
  latestCommittedFormChange
) => {
  const filteredSchema = JSON.parse(JSON.stringify(formSchema));
  const newDataObject = {};

  for (const key of Object.keys(filteredSchema.properties)) {
    if (
      formChange?.newFormData?.[key] ===
      latestCommittedFormChange?.newFormData?.[key]
    )
      delete filteredSchema.properties[key];
    else newDataObject[key] = formChange.newFormData?.[key];
  }
  return { formSchema: filteredSchema, formData: newDataObject };
};
