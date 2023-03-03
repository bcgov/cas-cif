import { ThemeProps } from "@rjsf/core";
import ReadOnlyFieldTemplate from "./ReadOnlyFieldTemplate";
import ReadOnlyObjectFieldTemplate from "./ReadOnlyObjectFieldTemplate";
import ReadOnlyAdditionalFundingSourcesArrayFieldTemplate from "./ReadOnlyAdditionalFundingSourcesArrayFieldTemplate";
import { utils } from "@rjsf/core";
import ReadOnlyWidget from "./widgets/ReadOnlyWidget";
import ReadOnlyDateWidget from "./widgets/ReadOnlyDateWidget";
import ReadOnlyAdjustableCalculatedValueWidget from "./widgets/ReadOnlyAdjustableCalculatedValueWidget";
import CalculatedValueWidget from "./widgets/CalculatedValueWidget";
import ReadOnlyNumberWidget from "./widgets/ReadOnlyNumberWidget";
import SelectWithNotifyWidget from "./widgets/SelectWithNotifyWidget";
import ModalWidget from "./widgets/ModalWidget";
import AnticipatedFundingAmountPerFiscalYearWidget from "./widgets/AnticipatedFundingAmountPerFiscalYearWidget";

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
    PhoneNumberWidget: ReadOnlyWidget,
    SelectRfpWidget: ReadOnlyWidget,
    DateWidget: ReadOnlyDateWidget,
    AdjustableCalculatedValueWidget: ReadOnlyAdjustableCalculatedValueWidget,
    ReadOnlyAdjustableCalculatedValueWidget,
    CalculatedValueWidget,
    NumberWidget: ReadOnlyNumberWidget,
    SelectWithNotifyWidget: SelectWithNotifyWidget,
    ModalWidget,
    AnticipatedFundingAmountPerFiscalYearWidget,
  },
  ObjectFieldTemplate: ReadOnlyObjectFieldTemplate,
  FieldTemplate: ReadOnlyFieldTemplate,
  ArrayFieldTemplate: ReadOnlyAdditionalFundingSourcesArrayFieldTemplate,
};

export default readOnlyTheme;
