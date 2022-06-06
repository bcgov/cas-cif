import { Chip } from "@mui/material";

interface Props {
  label?: string;
  variant: "complete" | "late" | "onTrack" | "inReview" | "customText" | "none";
}

const colours = {
  complete: {
    labelColour: "#236631",
    badgeColour: "#EAF3EC",
    label: "Complete",
  },
  late: {
    labelColour: "#CC242A",
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
  customText: {
    labelColour: "#666666",
    badgeColour: "#E8E8E8",
  },
};

const StatusBadge: React.FC<Props> = ({ label = "custom text", variant }) => {
  return (
    <>
      <Chip
        label={variant === "customText" ? label : colours[variant].label}
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
      <style jsx>
        {`
          .MuiChip-label {
            color: pink;
          }
        `}
      </style>
    </>
  );
};

export default StatusBadge;
