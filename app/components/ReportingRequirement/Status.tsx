import StatusBadge from "components/StatusBadge";

interface Props {
  reportType: "Quarterly" | "Annual" | "Milestone";
  variant: "complete" | "late" | "onTrack" | "inReview" | "none";
}

const Status: React.FC<Props> = ({ reportType, variant }) => {
  return (
    <div>
      Status of {reportType} Reports <StatusBadge variant={variant} />
      <style jsx>{`
        div {
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
};

export default Status;
