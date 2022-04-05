import { ThemeProps, withTheme } from "@rjsf/core";
import FieldTemplate from "./FieldTemplate";
import ObjectFieldTemplate from "./ObjectFieldTemplate";
import { utils } from "@rjsf/core";

import { UiSchema } from "@rjsf/core";
import getRequiredLabel from "../utils/getRequiredLabel";
const { fields, widgets } = utils.getDefaultRegistry();

import { WidgetProps } from "@rjsf/core";

const ReadOnlyWidget: React.FC<WidgetProps> = ({ options }) => {
  return (
    <span className="paragraph-text">
      <dt>{options.title}</dt>
      <dd>{options.text}</dd>
    </span>
  );
};

const theme: ThemeProps = {
  children: <></>,
  fields: { ...fields },
  widgets: {
    ...widgets,
    ReadOnlyWidget: ReadOnlyWidget,
  },
  ObjectFieldTemplate: ObjectFieldTemplate,
  FieldTemplate: FieldTemplate,
};

export default withTheme(theme);
