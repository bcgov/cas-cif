import { Button } from "@button-inc/bcgov-theme";
import Link from "next/link";
import {
  getAttachmentDeleteRoute,
  getAttachmentDownloadRoute,
} from "routes/pageRoutes";
import { graphql, useFragment } from "react-relay";
import useDiscardProjectAttachmentFormChange from "mutations/attachment/discardProjectAttachmentFormChange";
import { AttachmentTableRow_attachment$key } from "__generated__/AttachmentTableRow_attachment.graphql";

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

  const handleArchiveAttachment = (attachmentId) => {
    // safer to delete from our app and then delete from GCS, then if breaks in the middle we don't have weird data, just storing extra stuff
    // best to do it as middleware so it's one request, if it fails the whole thing fails
    // have the server call the graphql endpoint

    if (isFirstRevision) {
      // delete from cloud storage and call discard mutation
      fetch(getAttachmentDeleteRoute(attachmentId).pathname, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables: {
            input: {
              formChangeId: formChangeRowId,
            },
            // connections: [connectionId],
          },
        }),
      });
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
        <td>{fullName}</td>
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
