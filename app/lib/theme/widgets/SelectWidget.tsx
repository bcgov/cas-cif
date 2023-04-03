import { WidgetProps } from "@rjsf/core";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";

interface Option {
  type: string;
  title: string;
  enum: number[];
  value: number;
}

const SelectWidget: React.FunctionComponent<WidgetProps> = (props) => {
  const {
    id,
    onChange,
    schema,
    placeholder,
    label,
    required,
    uiSchema,
    value,
    disabled,
  } = props;

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }
  const options = schema.anyOf as Array<Option>;

  return (
    <div>
      <Dropdown
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        size={(uiSchema && uiSchema["bcgov:size"]) || "large"}
        required={required}
        value={value}
        aria-label={label}
        disabled={disabled}
      >
        {placeholder && (
          <option key={`option-placeholder-${id}`} value={undefined}>
            {placeholder}
          </option>
        )}
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
          div :global(input) {
            width: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default SelectWidget;
