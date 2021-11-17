import React from "react";
import { ThemeProps, WidgetProps, withTheme } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";

const TextWidget: React.FunctionComponent<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
}) => {
  return (
    <Input
      id={id}
      onChange={onChange}
      placeholder={placeholder}
      label={label}
      size="large"
    ></Input>
  );
};

const Theme: ThemeProps = {
  widgets: {
    TextWidget: TextWidget,
  },
};

export default withTheme(Theme);
