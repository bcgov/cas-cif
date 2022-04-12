import Button from "@button-inc/bcgov-theme/Button";
import downloadFile from "lib/helpers/download";
import Link from "next/link";
import { getAttachmentViewPageRoute } from "pageRoutes";
import { useFragment, graphql } from "react-relay";
import { AttachmentTableRow_attachment$key } from "__generated__/AttachmentTableRow_attachment.graphql";

interface Props {
  attachment: AttachmentTableRow_attachment$key;
}

const AttachmentTableRow: React.FC<Props> = ({ attachment }) => {
  const {
    id,
    file,
    fileName,
    fileType,
    fileSize,
    createdAt,
    cifUserByCreatedBy: { fullName },
  } = useFragment(
    graphql`
      fragment AttachmentTableRow_attachment on Attachment {
        id
        file
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

  const handleDownloadClick = () => {
    downloadFile(file);
  };

  return (
    <tr>
      <td>{fileName}</td>
      <td>{fileType}</td>
      <td>{fileSize}</td>
      <td>{fullName}</td>
      <td>{createdAt}</td>
      <td>
        <Link href={getAttachmentViewPageRoute(id)}>View</Link>
        <Button onClick={handleDownloadClick} disabled>
          Download
        </Button>
      </td>
    </tr>
  );
};

export default AttachmentTableRow;
