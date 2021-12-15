import { WidgetProps } from "@rjsf/core";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";
import getRequiredLabel from "../utils/getRequiredLabel";

interface Option {
  type: string;
  title: string;
  enum: number[];
  value: number;
}

const SelectWidget: React.FunctionComponent<WidgetProps> = (props) => {
  const { id, onChange, schema, placeholder, label, required, uiSchema } =
    props;

  const options = schema.anyOf as Array<Option>;
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
        {options.map((opt) => {
          return (
            <option key={opt.enum[0]} value={opt.enum[0]}>
              {opt.title}
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
