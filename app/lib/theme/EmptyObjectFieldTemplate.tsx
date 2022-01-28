import { ObjectFieldTemplateProps } from "@rjsf/core";

const EmptyObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = (
  props
) => {
  return props.properties.map((prop) => prop.content) as any;
};

export default EmptyObjectFieldTemplate;
