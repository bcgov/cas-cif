import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { Button } from "@button-inc/bcgov-theme";
import ReadOnlyWidget from "lib/theme/widgets/ReadOnlyWidget";
import { WidgetProps } from "@rjsf/core";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import { useState } from "react";

// Custom widget to update the revision status
const RevisionStatusWidget: React.FC<WidgetProps> = (props) => {
  const { schema, value, formContext } = props;

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }

  const [updateProjectRevision, isUpdatingProjectRevision] =
    useUpdateProjectRevision();

  const projectRevision = formContext.projectRevision;

  const [updated, setUpdated] = useState(false);

  const clickHandler = () => {
    return new Promise((resolve, reject) =>
      updateProjectRevision({
        variables: {
          input: {
            id: projectRevision.id,
            projectRevisionPatch: { revisionStatus: value },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id: projectRevision.id,
            },
          },
        },
        onCompleted: () => setUpdated(true),
        onError: reject,
        debounceKey: projectRevision.id,
      })
    );
  };

  return (
    <div>
      {projectRevision.changeStatus === "pending" ? (
        <div>
          <SelectWidget
            {...props}
            onChange={(e) => {
              setUpdated(false);
              props.onChange(e);
            }}
          />
          <Button
            type="submit"
            onClick={clickHandler}
            style={{ marginRight: "1rem" }}
            disabled={isUpdatingProjectRevision}
          >
            Update
          </Button>
          {updated && <small>Updated</small>}
          <style jsx>{`
            div {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            div :global(.pg-select) {
              width: 18em;
            }
          `}</style>
        </div>
      ) : (
        <ReadOnlyWidget {...props} />
      )}
    </div>
  );
};

export default RevisionStatusWidget;
