import { WidgetProps } from "@rjsf/core";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";
import getRequiredLabel from "../utils/getRequiredLabel";

const SelectWidget: React.FunctionComponent<WidgetProps> = (props) => {
  const { id, onChange, options, placeholder, label, required, uiSchema } = props;
  console.log(props)
  return (
    <>
      <label htmlFor={`funding-stream-dropdown-${props.id}`}>
        {getRequiredLabel(label, required)}
      </label>
      <Dropdown
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        size={(uiSchema && uiSchema["bcgov:size"]) || "large"}
        required={required}
      >
        {options.enumOptions.map((opt) => {
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </Dropdown>
      <style jsx>
        {`
          :global(input) {
            width: 100%;
          }
        `}
      </style>
    </>
  );
};

export default SelectWidget;