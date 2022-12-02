import { Button } from "@button-inc/bcgov-theme";
import { WidgetProps } from "@rjsf/core";
import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { useMemo } from "react";
import SelectWidget from "./SelectWidget";

const AmendmentStatusWidget: React.FC<WidgetProps> = (props) => {
  const { schema, uiSchema, value, formContext } = props;

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }

  const actionButtonLabel = uiSchema["ui:options"]?.actionButtonLabel;

  const [updateProjectRevision, isUpdatingProjectRevision] =
    useUpdateProjectRevision();

  const { revisionId, changeStatus } = formContext;

  const disableWidget = useMemo(
    () => isUpdatingProjectRevision || changeStatus === "committed",
    [isUpdatingProjectRevision, changeStatus]
  );

  const clickHandler = () => {
    return new Promise((resolve, reject) =>
      updateProjectRevision({
        variables: {
          input: {
            id: revisionId,
            projectRevisionPatch: { amendmentStatus: value },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id: revisionId,
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
      <SelectWidget {...props} disabled={disableWidget} />
      <Button
        type="submit"
        onClick={clickHandler}
        style={{ marginRight: "1rem" }}
        disabled={disableWidget}
      >
        {actionButtonLabel}
      </Button>
      <style jsx>{`
        div {
          display: flex;
          justify-content: space-between;
        }
        div :global(.pg-select) {
          width: 18em;
        }
      `}</style>
    </div>
  );
};

export default AmendmentStatusWidget;
