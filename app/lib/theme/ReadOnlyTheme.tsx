import { ThemeProps } from "@rjsf/core";
import FieldTemplate from "./FieldTemplate";
import ReadOnlyObjectFieldTemplate from "./ReadOnlyObjectFieldTemplate";
import { utils } from "@rjsf/core";
import ReadOnlyWidget from "./widgets/ReadOnlyWidget";
import ReadOnlyMoneyWidget from "./widgets/ReadOnlyMoneyWidget";
const { fields, widgets } = utils.getDefaultRegistry();

const readOnlyTheme: ThemeProps = {
  children: <></>,
  fields: { ...fields },
  widgets: {
    ...widgets,
    TextWidget: ReadOnlyWidget,
    TextAreaWidget: ReadOnlyWidget,
    SearchWidget: ReadOnlyWidget,
    DisplayOnly: ReadOnlyWidget,
    SelectWidget: ReadOnlyWidget,
    SelectParentWidget: ReadOnlyWidget,
    MoneyWidget: ReadOnlyMoneyWidget,
    PhoneNumberWidget: ReadOnlyWidget,
    SelectRfpWidget: ReadOnlyWidget,
    SelectProjectStatusWidget: ReadOnlyWidget,
  },
  ObjectFieldTemplate: ReadOnlyObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
};

export default readOnlyTheme;
