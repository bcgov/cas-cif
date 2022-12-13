import { WidgetProps } from "@rjsf/core";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";
import { Button } from "@button-inc/bcgov-theme";
import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";

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
    formContext,
  } = props;

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }
  const options = schema.anyOf as Array<Option>;

  const [updateProjectRevision, isUpdatingProjectRevision] =
    useUpdateProjectRevision();
  const revisionId = formContext.revisionId;
  const revisionStatus = formContext.revisionStatus;
  const handleUpdate = () => {
    return new Promise((resolve, reject) =>
      updateProjectRevision({
        variables: {
          input: {
            id: revisionId,
            projectRevisionPatch: {
              pendingActionsFrom: value,
            },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id: revisionId,
              pendingActionsFrom: value,
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
        debounceKey: revisionId,
      })
    );
  };

  return (
    <div>
      {revisionStatus == "Draft" ? (
        <>
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
          <Button
            onClick={handleUpdate}
            disabled={isUpdatingProjectRevision}
            type="submit"
          >
            Update
          </Button>
          <Button>Notify</Button>
        </>
      ) : (
        <em>{formContext.pendingActionsFrom}</em>
      )}
      <style jsx>
        {`
          div :global() {
            display: flex;
          }
          div :global(.pg-select) {
            width: 18em;
            margin-right: 1em;
          }
          div :global(.pg-button) {
            margin-right: 1em;
          }
        `}
      </style>
    </div>
  );
};

export default SelectWithNotifyWidget;
