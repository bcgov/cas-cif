import { ThemeProps } from "@rjsf/core";
import FieldTemplate from "./FieldTemplate";
import ObjectFieldTemplate from "./ObjectFieldTemplate";
import TextWidget from "./widgets/TextWidget";
import TextAreaWidget from "./widgets/TextAreaWidget";
import { utils } from "@rjsf/core";
import SearchDropdownWidget from "lib/theme/widgets/SearchDropdownWidget";
import DisplayOnlyWidget from "lib/theme/widgets/DisplayOnlyWidget";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import SelectParentWidget from "lib/theme/widgets/SelectParentWidget";
import PhoneNumberWidget from "lib/theme/widgets/PhoneNumberWidget";
import DueDateWidget from "lib/theme/widgets/DueDateWidget";
import DateWidget from "./widgets/DateWidget";
import { AdjustableCalculatedValueWidget } from "./widgets/AdjustableCalculatedValueWidget";
import ReadOnlyCalculatedValueWidget from "./widgets/ReadOnlyCalculatedValueWidget";
import NumberWidget from "./widgets/NumberWidget";
import RankWidget from "./widgets/RankWidget";

const { fields, widgets } = utils.getDefaultRegistry();

const formTheme: ThemeProps = {
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
    PhoneNumberWidget,
    DueDateWidget: DueDateWidget,
    DateWidget,
    AdjustableCalculatedValueWidget,
    ReadOnlyCalculatedValueWidget,
    NumberWidget,
    RankWidget,
  },
  ObjectFieldTemplate: ObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
};

export default formTheme;
