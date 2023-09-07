import { Button } from "@button-inc/bcgov-theme";
import useDiscardProjectAttachmentFormChange from "mutations/attachment/discardProjectAttachmentFormChange";
import Link from "next/link";
import { graphql, useFragment } from "react-relay";
import { getAttachmentDownloadRoute } from "routes/pageRoutes";
import { AttachmentTableRow_attachment$key } from "__generated__/AttachmentTableRow_attachment.graphql";
import hardDeleteAttachment from "./hardDeleteAttachment";
import { useRouter } from "next/router";

interface Props {
  attachment: AttachmentTableRow_attachment$key;
  connectionId: string;
  formChangeRowId: number;
  hideDelete?: boolean;
  isFirstRevision: boolean;
}

const AttachmentTableRow: React.FC<Props> = ({
  attachment,
  connectionId,
  formChangeRowId,
  hideDelete,
  isFirstRevision,
}) => {
  const [
    discardProjectAttachmentFormChange,
    isDiscardingProjectAttachmentFormChange,
  ] = useDiscardProjectAttachmentFormChange();
  const attachmentRow = useFragment(
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

  const router = useRouter();
  if (!attachmentRow) return null;
  const { id, fileName, fileType, fileSize, createdAt, cifUserByCreatedBy } =
    attachmentRow;

  const handleArchiveAttachment = (attachmentId) => {
    if (isFirstRevision) {
      hardDeleteAttachment(attachmentId, formChangeRowId);
      router.replace(router.asPath);
    } else {
      discardProjectAttachmentFormChange({
        variables: {
          input: {
            formChangeId: formChangeRowId,
          },
          connections: [connectionId],
        },
      });
    }
  };
  return (
    <>
      <tr>
        <td>{fileName}</td>
        <td>{fileType}</td>
        <td>{fileSize}</td>
        <td>{cifUserByCreatedBy?.fullName}</td>
        <td>{createdAt}</td>
        <td className="links">
          <Link href={getAttachmentDownloadRoute(id)} passHref>
            <Button size="small">Download</Button>
          </Link>
          {!hideDelete && (
            <Button
              onClick={() => handleArchiveAttachment(id)}
              disabled={isDiscardingProjectAttachmentFormChange}
              size="small"
            >
              Delete
            </Button>
          )}
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
