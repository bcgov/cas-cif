import { WidgetProps } from "@rjsf/core";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";
import { Button } from "@button-inc/bcgov-theme";

interface Option {
  type: string;
  title: string;
  enum: number[];
  value: number;
}

const SelectWithNotifyWidget: React.FunctionComponent<WidgetProps> = (
  props
) => {
  const {
    id,
    onChange,
    schema,
    placeholder,
    label,
    required,
    uiSchema,
    value,
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
      >
        <option key={`option-placeholder-${id}`} value={undefined}>
          {placeholder}
        </option>
        {options.map((opt) => {
          return (
            <option key={opt.enum[0]} value={opt.enum[0]}>
              {opt.title}
            </option>
          );
        })}
      </Dropdown>
      <Button>Notify</Button>
      <style jsx>
        {`
          div :global() {
            display: flex;
          }
          div :global(.pg-select) {
            width: 18em;
            margin-right: 1em;
          }
        `}
      </style>
    </div>
  );
};

export default SelectWithNotifyWidget;
