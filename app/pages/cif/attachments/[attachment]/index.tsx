import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { AttachmentQuery } from "__generated__/AttachmentQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const pageQuery = graphql`
  query AttachmentQuery($attachment: ID!) {
    session {
      ...DefaultLayout_session
    }
    attachment(id: $attachment) {
      id
      description
      fileName
      fileType
      fileSize
      createdAt
      cifUserByCreatedBy {
        fullName
      }
      projectStatusByProjectStatusId {
        name
      }
    }
  }
`;

function Attachment({ preloadedQuery }: RelayProps<{}, AttachmentQuery>) {
  const { session, attachment } = usePreloadedQuery(pageQuery, preloadedQuery);
  console.log(attachment);
  return (
    <DefaultLayout session={session}>
      <h2>{attachment.fileName}</h2>
      <h2>{attachment.fileType}</h2>
      <h2>{attachment.fileSize}</h2>
      <h2>{attachment.projectStatusByProjectStatusId.name}</h2>
      <h2>{attachment.fileName}</h2>
    </DefaultLayout>
  );
}

export default withRelay(Attachment, pageQuery, withRelayOptions);
