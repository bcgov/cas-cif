import type { JSONSchema7 } from "json-schema";

// Filter out fields from the formSchema that have not changed from the previous revision so the summary ignores these fields
// This is mainly used when the form has multiple fields within it and we want to check each field data with the previous revision
export const getFilteredEmissionIntensitySchema = (
  formSchema: JSONSchema7,
  formChange
) => {
  const filteredSchema = JSON.parse(JSON.stringify(formSchema));
  const newDataObject = {
    teimpReporting: {},
    uponCompletion: {},
  };

  // teimpReporting
  for (const key of Object.keys(
    filteredSchema.properties.teimpReporting.properties
  )) {
    if (
      formChange?.newFormData?.teimpReporting?.[key] ===
      formChange?.formChangeByPreviousFormChangeId?.newFormData
        ?.teimpReporting?.[key]
    )
      delete filteredSchema.properties.teimpReporting.properties[key];
    else
      newDataObject.teimpReporting[key] =
        formChange.newFormData?.teimpReporting?.[key];
  }

  // uponCompletion
  for (const key of Object.keys(
    filteredSchema.properties.uponCompletion.properties
  )) {
    if (
      formChange?.newFormData?.uponCompletion?.[key] ===
      formChange?.formChangeByPreviousFormChangeId?.newFormData
        ?.uponCompletion?.[key]
    )
      delete filteredSchema.properties.uponCompletion.properties[key];
    else
      newDataObject.uponCompletion[key] =
        formChange.newFormData?.uponCompletion?.[key];
  }

  return { formSchema: filteredSchema, formData: newDataObject };
};
