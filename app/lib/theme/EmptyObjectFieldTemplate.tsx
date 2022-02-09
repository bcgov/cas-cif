import { ObjectFieldTemplateProps } from "@rjsf/core";

/**
 *
 * The ObjectFieldTemplate is used by RJSF to render the "Object" type in a schema.
 * For really small forms, it can be useful to override the default tempalte with
 * an empty template that has only renders the individual form fields.
 *
 */

const EmptyObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = (
  props
) => {
  return props.properties.map((prop) => prop.content) as any;
};

export default EmptyObjectFieldTemplate;
