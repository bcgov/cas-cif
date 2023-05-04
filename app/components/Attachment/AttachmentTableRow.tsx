import { Button } from "@button-inc/bcgov-theme";
import Link from "next/link";
import { getAttachmentDownloadRoute } from "routes/pageRoutes";
import { graphql, useLazyLoadQuery } from "react-relay";
import { AttachmentTableRowQuery } from "__generated__/AttachmentTableRowQuery.graphql";
import useDeleteProjectAttachmentFormChange from "mutations/attachment/archiveProjectAttachmentFormChange";

interface Props {
  attachmentRowId: number;
  connectionId: string;
  formChangeRowId: number;
}

const AttachmentTableRow: React.FC<Props> = ({
  attachmentRowId,
  connectionId,
  formChangeRowId,
}) => {
  const [
    archiveProjectAttachmentFormChange,
    isArchivingProjectAttachmentFormChange,
  ] = useDeleteProjectAttachmentFormChange();

  const { attachmentByRowId } = useLazyLoadQuery<AttachmentTableRowQuery>(
    graphql`
      query AttachmentTableRowQuery($id: Int!) {
        attachmentByRowId(rowId: $id) {
          id
          fileName
          fileType
          fileSize
          createdAt
          cifUserByCreatedBy {
            fullName
          }
        }
      }
    `,
    { id: attachmentRowId }
  );

  const {
    id,
    fileName,
    fileType,
    fileSize,
    createdAt,
    cifUserByCreatedBy: { fullName },
  } = attachmentByRowId;

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
