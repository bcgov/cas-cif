import Dropdown from "@button-inc/bcgov-theme/Dropdown";
import { useMemo, useState } from "react";
import { WidgetProps } from "@rjsf/core";

export interface EntitySchema {
  list: [{ rowId: number; year?: number }];
  displayField: string;
  placeholder: string;
  label: string;
}

interface SelectParentComponentProps extends WidgetProps {
  parent: EntitySchema;
  child: EntitySchema;
  foreignKey: string;
  isInternal: boolean;
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
    isInternal,
  } = props;

  const {
    list: childList,
    displayField: childDisplayField,
    label: childLabel,
    placeholder: childPlaceholder,
  } = child;

  const {
    list: parentList,
    displayField: parentDisplayField,
    label: parentLabel,
    placeholder: parentPlaceholder,
  } = parent;

  const parentValue = childList.find((opt) => opt.rowId == parseInt(value))?.[
    foreignKey
  ];
  const [selectedParentId, setSelectedParentId] = useState(parentValue); //fundingStreamId

  const onParentChange = (e) => {
    // If the parent is changed, we need to reset the child value to undefined
    // but we keep the previous behavior if this widget is being used for external users since we only show the current year
    const newParentValue = parseInt(e.target.value) || undefined;
    onChange(
      isInternal
        ? undefined
        : childList.reverse().find((opt) => opt[foreignKey] === newParentValue)
            ?.rowId
    );
    setSelectedParentId(newParentValue);
  };

  const childOptions = useMemo(() => {
    return childList.filter((opt) => opt[foreignKey] === selectedParentId);
  }, [childList, foreignKey, selectedParentId]);

  return (
    <div>
      <label htmlFor={`select-parent-dropdown-${id}`}>{parentLabel}</label>
      <Dropdown
        id={`select-parent-dropdown-${id}`}
        onChange={onParentChange}
        size={(uiSchema && uiSchema["bcgov:size"]) || "large"}
        required={required}
        value={selectedParentId}
      >
        <option key={`option-placeholder-${id}`} value={undefined}>
          {parentPlaceholder}
        </option>
        {parentList.map((opt) => {
          return (
            <option key={opt.rowId} value={opt.rowId}>
              {opt[parentDisplayField]}
            </option>
          );
        })}
      </Dropdown>

      <label htmlFor={`select-child-dropdown-${id}`}>{childLabel}</label>
      <Dropdown
        id={`select-child-dropdown-${id}`}
        onChange={(e) => onChange(parseInt(e.target.value) || undefined)}
        size={(uiSchema && uiSchema["bcgov:size"]) || "large"}
        required={required}
        value={value}
      >
        {childPlaceholder && (
          <option key={`option-placeholder-${id}`} value={undefined}>
            {childPlaceholder}
          </option>
        )}
        {childOptions.map((opt) => {
          return (
            <option key={opt.rowId} value={opt.rowId}>
              {opt[childDisplayField]}
            </option>
          );
        })}
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
