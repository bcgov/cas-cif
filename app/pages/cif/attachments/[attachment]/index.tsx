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
      fileName
      fileType
      fileSize
      createdAt
      cifUserByCreatedBy {
        fullName
      }
    }
  }
`;

function Attachment({ preloadedQuery }: RelayProps<{}, AttachmentQuery>) {
  const { session, attachment } = usePreloadedQuery(pageQuery, preloadedQuery);
  return (
    <DefaultLayout session={session}>
      <dl>
        <dt>File Name</dt>
        <dd>{attachment.fileName}</dd>
        <dt>File Type</dt>
        <dd>{attachment.fileType}</dd>
        <dt>File Size</dt>
        <dd>{attachment.fileSize}</dd>
        <dt>Created By</dt>
        <dd>{attachment.cifUserByCreatedBy.fullName}</dd>
        <dt>Created At</dt>
        <dd>{attachment.createdAt}</dd>
      </dl>
    </DefaultLayout>
  );
}

export default withRelay(Attachment, pageQuery, withRelayOptions);
