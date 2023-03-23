import { JSONSchema7 } from "json-schema";

/**
 * Specific filter function for the milestone schema that
 *  - flattens the existing schema
 *  - removes the properties not in the form change data
 *  - returns the pruned, flat schema and only the form change data that changed since the previous version
 *
 * @param formSchema
 * @param formChange
 * @returns {{formSchema: JSONSchema7, formData: any}}
 */
export const getMilestoneFilteredSchema = (
  formSchema: JSONSchema7,
  formChange
) => {
  const properties = formSchema.properties;
  // schema dependencies
  const hasExpensesDependencyProperties = (formSchema as any).dependencies
    .hasExpenses.oneOf[1].properties;
  const reportTypeDependencyProperties = (formSchema as any).dependencies
    .reportType.oneOf[1].properties;

  const filteredSchema = {
    ...formSchema,
    properties: {
      ...properties,
      ...hasExpensesDependencyProperties,
      ...reportTypeDependencyProperties,
    },
  };
  delete filteredSchema.dependencies;

  JSON.parse(JSON.stringify(formSchema));
  const newDataObject: any = {};

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
