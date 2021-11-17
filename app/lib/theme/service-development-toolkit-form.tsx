import { ThemeProps, withTheme } from "@rjsf/core";
import FieldTemplate from "./FieldTemplate";
import ObjectFieldTemplate from "./ObjectFieldTemplate";
import SubmitButton from "./SubmitButton";
import TextWidget from "./widgets/TextWidget";

const Theme: ThemeProps = {
  children: <SubmitButton />,
  fields: {},
  widgets: {
    TextWidget: TextWidget,
  },
  ObjectFieldTemplate: ObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
};

export default withTheme(Theme);
