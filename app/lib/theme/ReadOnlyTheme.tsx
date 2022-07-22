import { ThemeProps } from "@rjsf/core";
import ReadOnlyFieldTemplate from "./ReadOnlyFieldTemplate";
import ReadOnlyObjectFieldTemplate from "./ReadOnlyObjectFieldTemplate";
import { utils } from "@rjsf/core";
import ReadOnlyWidget from "./widgets/ReadOnlyWidget";
import ReadOnlyMoneyWidget from "./widgets/ReadOnlyMoneyWidget";
import ReadOnlyDateWidget from "./widgets/ReadOnlyDateWidget";
import ReadOnlyAdjustableCalculatedValueWidget from "./widgets/ReadOnlyAdjustableCalculatedValueWidget";
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
    ConditionalAmountWidget: ReadOnlyMoneyWidget,
    DueDateWidget: ReadOnlyDateWidget,
    DateWidget: ReadOnlyDateWidget,
    AdjustableCalculatedValueWidget: ReadOnlyAdjustableCalculatedValueWidget,
  },
  ObjectFieldTemplate: ReadOnlyObjectFieldTemplate,
  FieldTemplate: ReadOnlyFieldTemplate,
};

export default readOnlyTheme;
