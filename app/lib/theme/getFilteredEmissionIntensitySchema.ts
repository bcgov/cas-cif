import type { JSONSchema7 } from "json-schema";

export const getFilteredEmissionIntensitySchema = (
  formSchema: JSONSchema7,
  formChange
) => {
  const filteredSchema = JSON.parse(JSON.stringify(formSchema));
  const formDataObject = {
    teimpReporting: {},
    uponCompletion: {},
    calculatedValues: {},
  };

  /*
   * This function filters out the properties that are unchanged from the previous form change.
   * It also filters out the properties that are not changed in the current form change.
   * We have some calculated values which are not directly in the schema so we need to treat them separately.(like calculatedEiPerformance)
   */

  const filterProperties = (properties, newDataObject) => {
    const propertiesObj = filteredSchema.properties[properties]?.properties;
    const newFormDataValues = formChange.newFormData?.[properties] || {};
    const previousFormData =
      formChange.formChangeByPreviousFormChangeId?.newFormData?.[properties] ||
      {};
    for (const key of Object.keys(propertiesObj)) {
      // used to filter out the properties that are in the form data
      const isNewFormDataUnchanged =
        newFormDataValues[key] &&
        newFormDataValues[key] === previousFormData[key];

      // used to filter out the properties that are in the form change like calculated values
      const isFormChangeDataUnchanged =
        formChange[key] &&
        formChange[key] === formChange.formChangeByPreviousFormChangeId?.[key];

      // used to filter out the properties that never appeared in the form
      const keyNotAppearedInForm =
        !newFormDataValues[key] &&
        !previousFormData[key] &&
        !formChange[key] &&
        !formChange.formChangeByPreviousFormChangeId?.[key];

      if (
        isNewFormDataUnchanged ||
        isFormChangeDataUnchanged ||
        keyNotAppearedInForm
      )
        delete propertiesObj[key];
      else
        newDataObject[properties][key] =
          newFormDataValues[key] ?? formChange[key];
    }
  };

  filterProperties("teimpReporting", formDataObject);
  filterProperties("uponCompletion", formDataObject);
  filterProperties("calculatedValues", formDataObject);

  return { formSchema: filteredSchema, formData: formDataObject };
};
