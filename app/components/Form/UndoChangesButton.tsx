import { Button } from "@button-inc/bcgov-theme";

interface Props {
  onClick: () => void;
}

const UndoChangesButton: React.FC<Props> = ({ onClick }) => {
  return (
    <Button
      type="button"
      style={{
        marginRight: "1rem",
        marginBottom: "1rem",
        marginLeft: "0rem",
      }}
      variant="secondary"
      onClick={onClick}
      className="undo-changes-button"
    >
      Undo Changes
    </Button>
  );
};

export default UndoChangesButton;
