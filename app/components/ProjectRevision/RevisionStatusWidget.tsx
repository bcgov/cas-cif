import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { Button } from "@button-inc/bcgov-theme";
import ReadOnlyWidget from "lib/theme/widgets/ReadOnlyWidget";
import { WidgetProps } from "@rjsf/core";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import { useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { useCommitProjectRevision } from "mutations/ProjectRevision/useCommitProjectRevision";
import { getProjectRevisionViewPageRoute } from "routes/pageRoutes";
import { useRouter } from "next/router";

const RevisionStatusWidgetFragment = graphql`
  fragment RevisionStatusWidget_projectRevision on ProjectRevision {
    id
    rowId
    changeStatus
    formChangesByProjectRevisionId {
      edges {
        node {
          validationErrors
        }
      }
    }
  }
`;

// Custom widget to update the revision status
const RevisionStatusWidget: React.FC<WidgetProps> = (props) => {
  const { schema, value, formContext, onChange } = props;
  const projectRevision = formContext.projectRevision;

  const { id, rowId, changeStatus, formChangesByProjectRevisionId } =
    useFragment(RevisionStatusWidgetFragment, projectRevision);

  const hasValidationErrors: boolean = useMemo(
    () =>
      formChangesByProjectRevisionId.edges.some(
        (edge) => edge.node.validationErrors.length > 0
      ),
    [formChangesByProjectRevisionId.edges]
  );

  const router = useRouter();

  if (!(schema && schema.anyOf && typeof schema.anyOf !== "undefined")) {
    throw new Error("schema.anyOf does not exist!");
  }

  const [informationalText, setInformationalText] = useState("");
  const [initialValue, setInitialValue] = useState(value);
  const [disabled, setDisabled] = useState(true);

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
      onCompleted: () => router.replace(getProjectRevisionViewPageRoute(id)),
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
        setInformationalText("Updated");
        setInitialValue(value);
        setDisabled(true);
      },
      debounceKey: id,
    });

  const statusChangeHandler = (newStatus: string) => {
    const committingNotAllowed =
      hasValidationErrors && ["Applied", "Approved"].includes(newStatus);

    setDisabled(
      initialValue === newStatus ||
        isUpdatingProjectRevision ||
        isCommittingProjectRevision ||
        committingNotAllowed
    );
    // set the text next to the button based on whether the value has changed or not
    setInformationalText(
      committingNotAllowed
        ? 'You can not commit this revision/amendment. Please see "Attention Required".'
        : newStatus === "Applied"
        ? 'Once approved, this revision will be immutable. Click the "Update" button to confirm.'
        : initialValue !== newStatus
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
              disabled={disabled}
              size="small"
            >
              Update
            </Button>
          </div>
          <small>{informationalText}</small>
          <style jsx>{`
            div {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
            }
            div :global(.pg-select) {
              width: 16.5em;
            }
            div :global(button.pg-button) {
              margin: 0 1em;
            }
            // Just to make the text wrap when the screen is small
            @media (max-width: 1520px) {
              div :global(small) {
                flex-basis: 100%;
                margin-top: 0.5rem;
              }
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
