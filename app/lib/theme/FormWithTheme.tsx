import { ThemeProps, withTheme } from "@rjsf/core";
import FieldTemplate from "./FieldTemplate";
import ObjectFieldTemplate from "./ObjectFieldTemplate";
import TextWidget from "./widgets/TextWidget";
import { utils } from "@rjsf/core";
import SearchDropdownWidget from "lib/theme/widgets/SearchDropdownWidget";
import DisplayOnlyWidget from "lib/theme/widgets/DisplayOnlyWidget";
import SelectWidget from "lib/theme/widgets/SelectWidget";

const { fields, widgets } = utils.getDefaultRegistry();

const theme: ThemeProps = {
  children: <></>,
  fields: { ...fields },
  widgets: {
    ...widgets,
    TextWidget: TextWidget,
    SearchWidget: SearchDropdownWidget,
    DisplayOnly: DisplayOnlyWidget,
    SelectWidget: SelectWidget,
  },
  ObjectFieldTemplate: ObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
};

export default withTheme(theme);
