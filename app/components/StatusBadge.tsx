import { Chip } from "@mui/material";

interface Props {
  label?: string;
  variant: "complete" | "late" | "onTrack" | "inReview" | "customText" | "none";
}

const colours = {
  complete: {
    labelColour: "#2E8540",
    badgeColour: "rgba(47, 132, 64, 0.1)",
    label: "Complete",
  },
  late: {
    labelColour: "#D9292F",
    badgeColour: "rgba(217, 41, 47, 0.1)",
    label: "Late",
  },
  onTrack: {
    labelColour: "#FFFFFF",
    badgeColour: "#003366",
    label: "On track",
  },
  none: {
    labelColour: "#767676",
    badgeColour: "rgba(156, 156, 156, 0.1)",
    label: "None",
  },
  inReview: {
    labelColour: "#003366",
    badgeColour: "rgba(0, 51, 102, 0.1)",
    label: "In review",
  },
  customText: {
    labelColour: "#003366",
    badgeColour: "rgba(0, 51, 102, 0.1)",
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
