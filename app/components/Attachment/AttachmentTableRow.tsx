import Button from "@button-inc/bcgov-theme/Button";
import downloadFile from "lib/helpers/download";
import { useRouter } from "next/router";
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

  const router = useRouter();

  const handleViewClick = () => {
    router.push(getAttachmentViewPageRoute(id));
  };

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
        <Button onClick={handleViewClick}>View</Button>
        <Button onClick={handleDownloadClick} disabled>
          Download
        </Button>
      </td>
    </tr>
  );
};

export default AttachmentTableRow;
