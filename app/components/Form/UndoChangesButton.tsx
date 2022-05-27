import { Button } from "@button-inc/bcgov-theme";
import { useUndoFormChanges } from "mutations/FormChange/undoFormChanges";
interface Props {
  formChangeIds: number[];
}

const UndoChangesButton: React.FC<Props> = ({ formChangeIds }) => {
  const [undoFormChanges] = useUndoFormChanges();

  const handleClick = () => {
    undoFormChanges({
      variables: {
        input: {
          formChangesIds: formChangeIds,
        },
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
