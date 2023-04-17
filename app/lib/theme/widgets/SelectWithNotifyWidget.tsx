import { WidgetProps } from "@rjsf/core";
import Dropdown from "@button-inc/bcgov-theme/Dropdown";
import { Button } from "@button-inc/bcgov-theme";
import { useUpdatePendingActionsFrom } from "mutations/ProjectRevision/updatePendingActionsFrom";
import { graphql, useFragment } from "react-relay";

interface Option {
  type: string;
  title: string;
  enum: number[];
  value: number;
}

const SelectWithNotifyWidgetFragment = graphql`
  fragment SelectWithNotifyWidget_projectRevision on ProjectRevision {
    id
    pendingActionsFrom
    revisionStatus
  }
`;

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

  const [updatePendingActionsFrom, isUpdatingPendingActionsFrom] =
    useUpdatePendingActionsFrom();
  const projectRevision = formContext.projectRevision;
  const {
    id: revisionId,
    revisionStatus,
    pendingActionsFrom,
  } = useFragment(SelectWithNotifyWidgetFragment, projectRevision);
  const handleUpdate = () => {
    return new Promise((resolve, reject) =>
      updatePendingActionsFrom({
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
      {["Draft", "In Discussion"].includes(revisionStatus) ? (
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
          <div className="buttonGrid">
            <Button
              onClick={handleUpdate}
              disabled={isUpdatingPendingActionsFrom}
              type="submit"
              style={{ marginBottom: "1rem" }}
            >
              Update
            </Button>
            <a href="#modal">
              <Button>Notify</Button>
            </a>
          </div>
        </>
      ) : (
        <>
          {pendingActionsFrom ? <>{pendingActionsFrom}</> : <em>Not Added</em>}
        </>
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
          .buttonGrid {
            display: flex;
            flex-direction: column;
          }
        `}
      </style>
    </div>
  );
};

export default SelectWithNotifyWidget;
