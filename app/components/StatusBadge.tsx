import { Chip } from "@mui/material";

interface Props {
  label?: string;
  variant:
    | "complete"
    | "late"
    | "onTrack"
    | "inReview"
    | "none"
    | "notDue"
    | "dueIn";
}

const colours = {
  complete: {
    labelColour: "#236631",
    badgeColour: "#EAF3EC",
    label: "Complete",
  },
  late: {
    labelColour: "#981B1F",
    badgeColour: "#FBEAEA",
    label: "Late",
  },
  onTrack: {
    labelColour: "#FFFFFF",
    badgeColour: "#003366",
    label: "On track",
  },
  none: {
    labelColour: "#666666",
    badgeColour: "#E8E8E8",
    label: "None",
  },
  inReview: {
    labelColour: "#003366",
    badgeColour: "#E6EBF0",
    label: "In review",
  },
  notDue: {
    labelColour: "#003366",
    badgeColour: "#E6EBF0",
    label: "Not due",
  },
  dueIn: {
    labelColour: "#FFFFFF",
    badgeColour: "#003366",
    label: "Due in",
  },
};

const StatusBadge: React.FC<Props> = ({ label, variant }) => {
  return (
    <>
      <Chip
        label={label ?? colours[variant].label}
        role="status"
        sx={{
          backgroundColor: colours[variant].badgeColour,
          ".MuiChip-label": {
            color: colours[variant].labelColour,
            marginLeft: "6px",
            marginRight: "6px",
            marginTop: "12px",
            marginBottom: "12px",
            fontWeight: "bold",
          },
        }}
      />
    </>
  );
};

export default StatusBadge;
