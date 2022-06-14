import { Button } from "@button-inc/bcgov-theme";
import { useUndoFormChanges } from "mutations/FormChange/undoFormChanges";
import { MutableRefObject } from "react";
interface Props {
  formChangeIds: number[];
  formRefs?: MutableRefObject<{}>;
}

const UndoChangesButton: React.FC<Props> = ({ formChangeIds, formRefs }) => {
  const [undoFormChanges] = useUndoFormChanges();

  const handleClick = () => {
    undoFormChanges({
      variables: {
        input: {
          formChangesIds: formChangeIds,
        },
      },
      onCompleted: () => {
        if (formRefs) {
          Object.keys(formRefs.current).forEach((key) => {
            if (!formRefs.current[key]) delete formRefs.current[key];
          });
        }
      },
    });
  };

  return (
    <Button
      type="button"
      style={{
        marginRight: "1rem",
        marginBottom: "1rem",
        marginLeft: "0rem",
      }}
      variant="secondary"
      onClick={handleClick}
      className="undo-changes-button"
    >
      Undo Changes
    </Button>
  );
};

export default UndoChangesButton;
