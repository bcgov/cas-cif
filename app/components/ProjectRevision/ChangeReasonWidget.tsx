import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { Button, Textarea } from "@button-inc/bcgov-theme";
import ReadOnlyWidget from "lib/theme/widgets/ReadOnlyWidget";
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
const ChangeReasonWidget: React.FC<WidgetProps> = (props) => {
  const { value, formContext, onChange } = props;
  const projectRevision = formContext.projectRevision;

  const { id, changeStatus } = useFragment(
    ChangeReasonWidgetFragment,
    projectRevision
  );

  const [updated, setUpdated] = useState(true);
  const [informationalText, setInformationalText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        setUpdated(true);
        setInformationalText("Updated");
        setInitialValue(value);
      },
      debounceKey: id,
    });
  };

  const changeHandler = (e) => {
    const newValue = e.target.value;

    let valueChanged: boolean = initialValue !== newValue;
    setUpdated(!valueChanged);
    // set the text next to the button based on whether the value has changed or not
    setInformationalText(
      valueChanged
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
            size={"medium"}
            resize="vertical"
            onChange={changeHandler}
          />
          <div>
            <Button
              type="submit"
              onClick={updateRevisionStatus}
              style={{ marginRight: "1rem" }}
              disabled={updated || isUpdatingProjectRevision}
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
            div :global(button.pg-button) {
              margin: 0 1em;
            }
            div :global(.pg-textarea) {
              flex-grow: 1;
            }
            :global(textarea) {
              width: 100%;
              min-height: 10rem;
            }
          `}</style>
        </div>
      ) : (
        <ReadOnlyWidget {...props} />
      )}
    </div>
  );
};

export default ChangeReasonWidget;
