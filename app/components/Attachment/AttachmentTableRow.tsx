import Button from "@button-inc/bcgov-theme/Button";
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
    description,
    fileName,
    fileType,
    fileSize,
    createdAt,
    cifUserByCifUserId: { firstName, lastName },
    projectStatusByProjectStatusId: { name },
  } = useFragment(
    graphql`
      fragment AttachmentTableRow_attachment on Attachment {
        id
        description
        fileName
        fileType
        fileSize
        createdAt
        cifUserByCifUserId {
          firstName
          lastName
        }
        projectStatusByProjectStatusId {
          name
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
    console.log("TODO: Implement Document Download");
  };

  const formattedCifUserName = () => {
    return firstName + " " + lastName;
  };

  return (
    <tr>
      <td className="attachment-description">{description}</td>
      <td className="file-name">{fileName}</td>
      <td className="file-type">{fileType}</td>
      <td className="file-size">{fileSize}</td>
      <td className="uploaded-by">{formattedCifUserName()}</td>
      <td className="status-container">
        <span className="status-badge">{name}</span>
      </td>
      <td className="Flag for Review">{"TEMP"}</td>
      <td className="Received">{createdAt}</td>
      <td>
        <Button onClick={handleViewClick}>View</Button>
        <Button onClick={handleDownloadClick}>Download</Button>
      </td>
      <style jsx>{`
        .attachment-description,
        .status-container {
          text-align: center;
        }
        .status-badge {
          background-color: #555;
          color: #fff;
          padding: 0.2rem 0.6rem 0.3rem;
          border-radius: 0.25rem;
          border: 1px solid #d9d9d9;
          display: inline-block;
          white-space: nowrap;
        }
      `}</style>
    </tr>
  );
};

export default AttachmentTableRow;
