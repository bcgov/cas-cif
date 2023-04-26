import { WidgetProps } from "@rjsf/core";
import { Button } from "@button-inc/bcgov-theme";
import { useUpdatePendingActionsFrom } from "mutations/ProjectRevision/updatePendingActionsFrom";
import { graphql, useFragment } from "react-relay";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import ReadOnlyWidget from "lib/theme/widgets/ReadOnlyWidget";
import { useState } from "react";

const SelectWithNotifyWidgetFragment = graphql`
  fragment SelectWithNotifyWidget_projectRevision on ProjectRevision {
    id
    revisionStatus
  }
`;

const SelectWithNotifyWidget: React.FunctionComponent<WidgetProps> = (
  props
) => {
  const { onChange, schema, value, formContext } = props;

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }

  const [informationalText, setInformationalText] = useState("");
  const [initialValue, setInitialValue] = useState(value);

  const [updatePendingActionsFrom, isUpdatingPendingActionsFrom] =
    useUpdatePendingActionsFrom();
  const projectRevision = formContext.projectRevision;

  const { id, revisionStatus } = useFragment(
    SelectWithNotifyWidgetFragment,
    projectRevision
  );

  const handleUpdate = () => {
    return new Promise((resolve, reject) =>
      updatePendingActionsFrom({
        variables: {
          input: {
            id,
            projectRevisionPatch: {
              pendingActionsFrom: value ?? null,
            },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id,
              pendingActionsFrom: value,
            },
          },
        },
        onCompleted: () => {
          setInformationalText("Updated");
          setInitialValue(value);
        },
        onError: reject,
        debounceKey: id,
      })
    );
  };

  const changeHandler = (newValue: string) => {
    // set the text next to the button based on whether the value has changed or not
    setInformationalText(
      initialValue !== newValue
        ? 'To confirm your change, please click the "Update" button.'
        : ""
    );
    onChange(newValue);
  };

  return (
    <div>
      {revisionStatus !== "Applied" ? (
        <div>
          <SelectWidget {...props} onChange={changeHandler} placeholder=" " />
          <div className="buttonGrid">
            <div className="updateButton">
              <Button
                onClick={handleUpdate}
                disabled={
                  initialValue === value || isUpdatingPendingActionsFrom
                }
                type="submit"
                size="small"
              >
                Update
              </Button>
              <small>{informationalText}</small>
            </div>
            <div className="notifyButton">
              <a href="#modal">
                <Button type="button" size="small">
                  Notify
                </Button>
              </a>
              <small>
                To notify them by email, please click the &quot;Notify&quot;
                button.
              </small>
            </div>
          </div>
          <style jsx>
            {`
              div {
                display: flex;
              }
              div :global(.pg-select) {
                width: 16.5em;
                margin-right: 1em;
              }
              div :global(.pg-button) {
                margin-right: 1em;
              }
              .buttonGrid {
                display: flex;
                flex-direction: column;
                gap: 1em;
              }
              .updateButton {
                align-items: center;
                margin-bottom: 0;
              }
              .notifyButton {
                align-items: center;
              }
              .notifyButton :global(.pg-button) {
                padding-left: 2em;
                padding-right: 2em;
              }
            `}
          </style>
        </div>
      ) : (
        <ReadOnlyWidget {...props} />
      )}
    </div>
  );
};

export default SelectWithNotifyWidget;
