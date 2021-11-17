import { ThemeProps, withTheme } from "@rjsf/core";
import FieldTemplate from "./FieldTemplate";
import ObjectFieldTemplate from "./ObjectFieldTemplate";
import SubmitButton from "./SubmitButton";
import TextWidget from "./widgets/TextWidget";
import { utils } from "@rjsf/core";

const { fields, widgets } = utils.getDefaultRegistry();

const Theme: ThemeProps = {
  children: <SubmitButton />,
  fields: { ...fields },
  ArrayFieldTemplate: () => <div>This is an array.</div>,
  widgets: {
    ...widgets,
    TextWidget: TextWidget,
  },
  ObjectFieldTemplate: ObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
};

export default withTheme(Theme);
