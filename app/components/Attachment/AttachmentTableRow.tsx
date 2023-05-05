import { Button } from "@button-inc/bcgov-theme";
import Link from "next/link";
import { getAttachmentDownloadRoute } from "routes/pageRoutes";
import { graphql, useFragment } from "react-relay";
import useDeleteProjectAttachmentFormChange from "mutations/attachment/archiveProjectAttachmentFormChange";
import { AttachmentTableRow_attachment$key } from "__generated__/AttachmentTableRow_attachment.graphql";

interface Props {
  attachment: AttachmentTableRow_attachment$key;
  connectionId: string;
  formChangeRowId: number;
}

const AttachmentTableRow: React.FC<Props> = ({
  attachment,
  connectionId,
  formChangeRowId,
}) => {
  const [
    archiveProjectAttachmentFormChange,
    isArchivingProjectAttachmentFormChange,
  ] = useDeleteProjectAttachmentFormChange();
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
    archiveProjectAttachmentFormChange({
      variables: {
        input: {
          rowId: formChangeRowId,
          formChangePatch: {
            operation: "ARCHIVE",
          },
        },
        connections: [connectionId],
      },
    });
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
            disabled={isArchivingProjectAttachmentFormChange}
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
