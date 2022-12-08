import { WidgetProps } from "@rjsf/core";
import { Checkbox } from "@button-inc/bcgov-theme";

const ModalWidget: React.FC<WidgetProps> = ({ id, label, onChange, value }) => {
  return (
    <Checkbox
      type="checkbox"
      id={id}
      onChange={() => onChange(!value)}
      aria-label={label}
      checked={value}
      label={label.replace("(optional)", "")}
    />
  );
};

export default ModalWidget;
