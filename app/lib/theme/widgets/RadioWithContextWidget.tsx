import { RadioButton } from "@button-inc/bcgov-theme";
import { WidgetProps } from "@rjsf/core";
// import RadioButton from "@button-inc/bcgov-theme/RadioButton";

// interface Option {
//   type: string;
//   title: string;
//   enum: number[];
//   value: number;
// }

const RadioWithContextWidget: React.FunctionComponent<WidgetProps> = (
  props: WidgetProps
) => {
  console.log("props: ", props);
  //   const {
  //     id,
  //     onChange,
  //     schema,
  //     placeholder,
  //     label,
  //     required,
  //     uiSchema,
  //     value,
  //     disabled,
  //   } = props;

  //   if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
  //     throw new Error("schema.anyOf does not exist!");
  //   }

  //   const options = schema.anyOf as Array<Option>;

  return (
    <div>
      {props.options.enumOptions.map((option, index) => {
        console.log("option: ", option);
        return (
          <RadioButton
            key={index}
            value={option.value}
            disabled={false} // TODO CHANGE THIS
            name={option.label}
            id={option.value}
            label={option.label}
          />
        );
      })}
      {/* <Dropdown
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
      </style> */}
    </div>
  );
};

export default RadioWithContextWidget;
