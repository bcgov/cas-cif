import Dropdown from "@button-inc/bcgov-theme/Dropdown";
import { useEffect, useMemo, useState } from "react";
import { WidgetProps } from "@rjsf/core";

export interface EntitySchema {
  list: [{ rowId: any; year?: number }];
  displayField: string;
  placeholder: string;
  label: string;
}

interface SelectParentComponentProps extends WidgetProps {
  parent: EntitySchema;
  child: EntitySchema;
  foreignKey: string;
  displayIfChildrenEmpty: any;
}

const SelectParentWidget: React.FunctionComponent<
  SelectParentComponentProps
> = (props) => {
  const {
    id,
    onChange,
    required,
    uiSchema,
    value,
    parent,
    child,
    foreignKey,
    displayIfChildrenEmpty,
  } = props;

  const parentValue =
    child.list.find((opt) => opt.rowId == parseInt(value))?.[foreignKey] || "";
  const [selectedParentId, setSelectedParentId] = useState(parentValue);
  useEffect(() => {
    setSelectedParentId(parentValue);
  }, [parentValue]);

  const onParentChange = (val) => {
    setSelectedParentId(parseInt(val));
    onChange(parseInt(val));
    if (!parseInt(val)) onChange(undefined);
  };

  const childOptions = useMemo(() => {
    return child.list.filter((opt) => {
      return opt[foreignKey] === selectedParentId;
    });
  }, [child, foreignKey, selectedParentId]);

  return (
    <div>
      <label htmlFor={`select-parent-dropdown-${id}`}>{parent.label}</label>
      <Dropdown
        id={`select-parent-dropdown-${id}`}
        onChange={(e) => onParentChange(e.target.value || undefined)}
        size={(uiSchema && uiSchema["bcgov:size"]) || "large"}
        required={required}
        value={selectedParentId}
      >
        <option key={`option-placeholder-${id}`} value={undefined}>
          {parent.placeholder}
        </option>
        {parent.list.map((opt) => {
          return (
            <option key={opt.rowId} value={opt.rowId}>
              {opt[parent.displayField]}
            </option>
          );
        })}
      </Dropdown>

      <label htmlFor={`select-child-dropdown-${id}`}>{child.label}</label>
      <Dropdown
        id={`select-child-dropdown-${id}`}
        onChange={(e) => onChange(parseInt(e.target.value) || undefined)}
        size={(uiSchema && uiSchema["bcgov:size"]) || "large"}
        required={required}
        value={value}
      >
        {child.placeholder && (
          <option key={`option-placeholder-${id}`} value={undefined}>
            {child.placeholder}
          </option>
        )}
        {displayIfChildrenEmpty && childOptions.length === 0 ? (
          <option>{displayIfChildrenEmpty}</option>
        ) : (
          childOptions.map((opt) => {
            return (
              <option key={opt.rowId} value={opt.rowId}>
                {opt[child.displayField]}
              </option>
            );
          })
        )}
      </Dropdown>
      <style jsx>
        {`
          div :global(input) {
            width: 100%;
          }
          div :global(.pg-select-wrapper) {
            padding: 9px 2px 9px 2px;
            margin-bottom: 5px;
            margin-top: 2px;
          }
        `}
      </style>
    </div>
  );
};

export default SelectParentWidget;
