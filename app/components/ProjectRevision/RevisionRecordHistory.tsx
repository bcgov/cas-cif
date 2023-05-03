import { getLocaleFormattedDate } from "lib/theme/getLocaleFormattedDate";
import { graphql, useFragment } from "react-relay";
import { RevisionRecordHistory_projectRevision$key } from "__generated__/RevisionRecordHistory_projectRevision.graphql";

interface Props {
  projectRevision: RevisionRecordHistory_projectRevision$key;
}

const RevisionRecordHistory: React.FC<Props> = ({ projectRevision }) => {
  const { createdAt, updatedAt, cifUserByCreatedBy, cifUserByUpdatedBy } =
    useFragment(
      graphql`
        fragment RevisionRecordHistory_projectRevision on ProjectRevision {
          createdAt
          cifUserByCreatedBy {
            fullName
          }
          updatedAt
          cifUserByUpdatedBy {
            fullName
          }
        }
      `,
      projectRevision
    );
  return (
    <>
      <div className="revision-record-history-section">
        <dt>Revision record history</dt>
        {updatedAt && (
          <dd>
            <em>Updated by </em>
            {cifUserByUpdatedBy?.fullName || "Unknown"}
            <em> on </em>
            {getLocaleFormattedDate(updatedAt, "DATETIME_MED")}
          </dd>
        )}
        <dd>
          <em>Created by </em>
          {cifUserByCreatedBy?.fullName || "Unknown"}
          <em> on </em>
          {getLocaleFormattedDate(createdAt, "DATETIME_MED")}
        </dd>
      </div>
      <style jsx>{`
        .revision-record-history-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .revision-record-history-section > dd {
          margin-bottom: 0;
        }
        .revision-record-history-section > dd > em {
          font-weight: bold;
          font-size: 0.9em;
        }
      `}</style>
    </>
  );
};

export default RevisionRecordHistory;
