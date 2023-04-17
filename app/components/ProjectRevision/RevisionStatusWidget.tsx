import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { Button } from "@button-inc/bcgov-theme";
import ReadOnlyWidget from "lib/theme/widgets/ReadOnlyWidget";
import { WidgetProps } from "@rjsf/core";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { useCommitProjectRevision } from "mutations/ProjectRevision/useCommitProjectRevision";

const RevisionStatusWidgetFragment = graphql`
  fragment RevisionStatusWidget_projectRevision on ProjectRevision {
    id
    rowId
    changeStatus
  }
`;

// Custom widget to update the revision status
const RevisionStatusWidget: React.FC<WidgetProps> = (props) => {
  const { schema, value, formContext, onChange } = props;
  const projectRevision = formContext.projectRevision;

  const { id, rowId, changeStatus } = useFragment(
    RevisionStatusWidgetFragment,
    projectRevision
  );

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }

  const [updated, setUpdated] = useState(true);
  const [informationalText, setInformationalText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initialValue, setInitialValue] = useState(value);

  const [updateProjectRevision, isUpdatingProjectRevision] =
    useUpdateProjectRevision();

  const [commitProjectRevision, isCommittingProjectRevision] =
    useCommitProjectRevision();

  const commitRevision = () =>
    commitProjectRevision({
      variables: {
        input: {
          revisionToCommitId: rowId,
        },
      },
      optimisticResponse: {
        commitProjectRevision: {
          projectRevision: {
            id: id,
          },
        },
      },
    });

  const updateRevisionStatus = () =>
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
      onCompleted: () => {
        setUpdated(true);
        setInformationalText("Updated");
        setInitialValue(value);
      },
      debounceKey: id,
    });

  const statusChangeHandler = (newStatus: string) => {
    let valueChanged: boolean = initialValue !== newStatus;
    setUpdated(!valueChanged);
    // set the text next to the button based on whether the value has changed or not
    setInformationalText(
      newStatus === "Applied"
        ? 'Once approved, this revision will be immutable. Click the "Update" button to confirm.'
        : valueChanged
        ? 'To confirm your change, please click the "Update" button.'
        : ""
    );
    onChange(newStatus);
  };

  const clickHandler = () =>
    value === "Applied" ? commitRevision() : updateRevisionStatus();

  return (
    <div>
      {changeStatus === "pending" ? (
        <div>
          <SelectWidget {...props} onChange={statusChangeHandler} />
          <div>
            <Button
              type="submit"
              onClick={clickHandler}
              style={{ marginRight: "1rem" }}
              disabled={
                updated ||
                isUpdatingProjectRevision ||
                isCommittingProjectRevision
              }
            >
              Update
            </Button>
          </div>
          <small>{informationalText}</small>
          <style jsx>{`
            div {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            div :global(.pg-select) {
              width: 18em;
            }
            div :global(button.pg-button) {
              margin: 0 1em;
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
