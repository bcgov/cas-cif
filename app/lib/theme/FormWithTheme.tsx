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
import DateWidget from "./widgets/DateWidget";
import { AdjustableCalculatedValueWidget } from "./widgets/AdjustableCalculatedValueWidget";
import CalculatedValueWidget from "./widgets/CalculatedValueWidget";
import NumberWidget from "./widgets/NumberWidget";
import ModalWidget from "./widgets/ModalWidget";
import AnticipatedFundingAmountPerFiscalYearWidget from "./widgets/AnticipatedFundingAmountPerFiscalYearWidget";
import AdditionalFundingSourcesArrayFieldTemplate from "./AdditionalFundingSourcesArrayFieldTemplate";

const { fields, widgets } = utils.getDefaultRegistry();

const formTheme: ThemeProps = {
  children: <></>,
  fields: {
    ...fields,
  },
  widgets: {
    ...widgets,
    TextWidget: TextWidget,
    TextAreaWidget: TextAreaWidget,
    SearchWidget: SearchDropdownWidget,
    DisplayOnly: DisplayOnlyWidget,
    SelectWidget: SelectWidget,
    SelectParentWidget: SelectParentWidget,
    PhoneNumberWidget,
    DateWidget,
    AdjustableCalculatedValueWidget,
    CalculatedValueWidget,
    NumberWidget,
    ModalWidget,
    AnticipatedFundingAmountPerFiscalYearWidget,
  },
  ObjectFieldTemplate: ObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
  ArrayFieldTemplate: AdditionalFundingSourcesArrayFieldTemplate,
};

export default formTheme;
