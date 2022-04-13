import Link from "next/link";
import {
  getAttachmentDownloadRoute,
  getAttachmentViewPageRoute,
} from "pageRoutes";
import { useFragment, graphql } from "react-relay";
import { AttachmentTableRow_attachment$key } from "__generated__/AttachmentTableRow_attachment.graphql";

interface Props {
  attachment: AttachmentTableRow_attachment$key;
}

const AttachmentTableRow: React.FC<Props> = ({ attachment }) => {
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

  return (
    <tr>
      <td>{fileName}</td>
      <td>{fileType}</td>
      <td>{fileSize}</td>
      <td>{fullName}</td>
      <td>{createdAt}</td>
      <td>
        <Link href={getAttachmentViewPageRoute(id)}>View</Link>
        <Link href={getAttachmentDownloadRoute(id)}>Download</Link>
      </td>
    </tr>
  );
};

export default AttachmentTableRow;
