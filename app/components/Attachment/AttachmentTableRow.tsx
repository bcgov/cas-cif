import { Button } from "@button-inc/bcgov-theme";
import Link from "next/link";
import { getAttachmentDownloadRoute } from "routes/pageRoutes";
import { useFragment, graphql } from "react-relay";
import { AttachmentTableRow_attachment$key } from "__generated__/AttachmentTableRow_attachment.graphql";
interface Props {
  attachment: AttachmentTableRow_attachment$key;
  isArchivingAttachment: boolean;
  archiveAttachmentByID: (id: string) => void;
}

const AttachmentTableRow: React.FC<Props> = ({
  attachment,
  isArchivingAttachment,
  archiveAttachmentByID,
}) => {
  const {
    id,
    fileName,
    fileType,
    fileSize,
    createdAt,
    cifUserByCreatedBy: { fullName },
  } = useFragment(
    graphql`
      fragment AttachmentTableRow_attachment on Attachment {
        id
        fileName
        fileType
        fileSize
        createdAt
        cifUserByCreatedBy {
          fullName
        }
      }
    `,
    attachment
  );

  const handleArchiveAttachment = () => {
    archiveAttachmentByID(id);
  };

  return (
    <>
      <tr>
        <td>{fileName}</td>
        <td>{fileType}</td>
        <td>{fileSize}</td>
        <td>{fullName}</td>
        <td>{createdAt}</td>
        <td className="links">
          <Link href={getAttachmentDownloadRoute(id)} passHref>
            <Button size="small">Download</Button>
          </Link>
          <Button
            onClick={handleArchiveAttachment}
            disabled={isArchivingAttachment}
            size="small"
          >
            Delete
          </Button>
        </td>
      </tr>
      <style jsx>{`
        td.links {
          min-width: 15em;
        }
        td.links :global(button) {
          margin-right: 0.5em;
        }
      `}</style>
    </>
  );
};

export default AttachmentTableRow;
