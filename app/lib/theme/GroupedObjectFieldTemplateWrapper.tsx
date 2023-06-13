import { ObjectFieldTemplateProps } from "@rjsf/core";
import ObjectFieldTemplate from "./ObjectFieldTemplate";

const getPropsForGroup = (
  group: {
    title: string;
    fields: string[];
  },
  props: ObjectFieldTemplateProps
): ObjectFieldTemplateProps => {
  return {
    ...props,
    properties: props.properties.filter((p) => group.fields.includes(p.name)),
  };
};

const GroupedObjectFieldTemplateWrapper = (props: ObjectFieldTemplateProps) => {
  return (
    <>
      {props.formContext.groupSchema.map((group) => {
        const childProps = getPropsForGroup(group, props);
        return (
          <>
            <ObjectFieldTemplate
              key={group.title}
              {...childProps}
              title={group.title}
            />
          </>
        );
      })}
    </>
  );
};

export default GroupedObjectFieldTemplateWrapper;
