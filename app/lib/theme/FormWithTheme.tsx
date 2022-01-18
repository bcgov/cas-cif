import { ThemeProps, withTheme } from "@rjsf/core";
import FieldTemplate from "./FieldTemplate";
import ObjectFieldTemplate from "./ObjectFieldTemplate";
import TextWidget from "./widgets/TextWidget";
import TextAreaWidget from "./widgets/TextAreaWidget";
import { utils } from "@rjsf/core";
import SearchDropdownWidget from "lib/theme/widgets/SearchDropdownWidget";
import DisplayOnlyWidget from "lib/theme/widgets/DisplayOnlyWidget";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import SelectParentWidget from "lib/theme/widgets/SelectParentWidget";
import MoneyWidget from "lib/theme/widgets/MoneyWidget";

const { fields, widgets } = utils.getDefaultRegistry();

const theme: ThemeProps = {
  children: <></>,
  fields: { ...fields },
  widgets: {
    ...widgets,
    TextWidget: TextWidget,
    TextAreaWidget: TextAreaWidget,
    SearchWidget: SearchDropdownWidget,
    DisplayOnly: DisplayOnlyWidget,
    SelectWidget: SelectWidget,
    SelectParentWidget: SelectParentWidget,
    MoneyWidget: MoneyWidget
  },
  ObjectFieldTemplate: ObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
};

export default withTheme(theme);
