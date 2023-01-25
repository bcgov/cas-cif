import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { Button } from "@button-inc/bcgov-theme";
import ReadOnlyWidget from "lib/theme/widgets/ReadOnlyWidget";
import { WidgetProps } from "@rjsf/core";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";

const RevisionStatusWidgetFragment = graphql`
  fragment RevisionStatusWidget_projectRevision on ProjectRevision {
    id
    changeStatus
  }
`;

// Custom widget to update the revision status
const RevisionStatusWidget: React.FC<WidgetProps> = (props) => {
  const { schema, value, formContext } = props;
  const projectRevision = formContext.projectRevision;

  const { id, changeStatus } = useFragment(
    RevisionStatusWidgetFragment,
    projectRevision
  );

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }

  const [updateProjectRevision, isUpdatingProjectRevision] =
    useUpdateProjectRevision();

  const [updated, setUpdated] = useState(false);

  const clickHandler = () => {
    return new Promise((resolve, reject) =>
      updateProjectRevision({
        variables: {
          input: {
            id: id,
            projectRevisionPatch: { revisionStatus: value },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id: id,
            },
          },
        },
        onCompleted: () => setUpdated(true),
        onError: reject,
        debounceKey: id,
      })
    );
  };

  return (
    <div>
      {changeStatus === "pending" ? (
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
