import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { Button, Textarea } from "@button-inc/bcgov-theme";
import { WidgetProps } from "@rjsf/core";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";

const ChangeReasonWidgetFragment = graphql`
  fragment ChangeReasonWidget_projectRevision on ProjectRevision {
    id
    changeStatus
  }
`;

// Custom widget to update the revision change reason
// This widget is responsible to update the `change_reason` field on the `project_revision` table
// Name of this widget on the UI is `General Comments`
const ChangeReasonWidget: React.FC<WidgetProps> = (props) => {
  const { value, formContext, onChange } = props;
  const projectRevision = formContext.projectRevision;

  const { id, changeStatus } = useFragment(
    ChangeReasonWidgetFragment,
    projectRevision
  );

  const [informationalText, setInformationalText] = useState("");
  const [initialValue, setInitialValue] = useState(value ?? "");

  const [updateProjectRevision, isUpdatingProjectRevision] =
    useUpdateProjectRevision();

  const updateRevisionStatus = () => {
    updateProjectRevision({
      variables: {
        input: {
          id: id,
          projectRevisionPatch: { changeReason: value },
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
      },
      debounceKey: id,
    });
  };

  const changeHandler = (e) => {
    const newValue = e.target.value;
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
      {changeStatus === "pending" ? (
        <div>
          <Textarea
            value={value}
            size="medium"
            resize="vertical"
            onChange={changeHandler}
          />
          <div>
            <Button
              type="submit"
              onClick={updateRevisionStatus}
              style={{ marginRight: "1rem" }}
              disabled={
                initialValue === (value ?? "") || isUpdatingProjectRevision
              }
              size="small"
            >
              Update
            </Button>
          </div>
          {informationalText && <small>{informationalText}</small>}
          <style jsx>{`
            div {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
            }
            div :global(button.pg-button) {
              margin: 0 1em;
            }
            :global(textarea) {
              width: 28em;
              min-height: 10rem;
            }
            // Just to make the text wrap when the screen is small
            @media (max-width: 1520px) {
              div :global(small) {
                flex-basis: 100%;
              }
            }
          `}</style>
        </div>
      ) : (
        <dd>{value || <em>Not added</em>}</dd>
      )}
    </div>
  );
};

export default ChangeReasonWidget;
