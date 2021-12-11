import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { useRelayEnvironment } from "react-relay";
import FilePicker from "@button-inc/bcgov-theme/FilePicker";
import createAttachmentMutation from "mutations/attachment/createAttachment";
import { attachmentsQuery } from "__generated__/attachmentsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const AttachmentsQuery = graphql`
  query attachmentsQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      allAttachments(first: 2147483647)
        @connection(key: "connection_allAttachments") {
        __id
        edges {
          node {
            file
          }
        }
      }
    }
  }
`;

function Attachments({ preloadedQuery }: RelayProps<{}, attachmentsQuery>) {
  const { query } = usePreloadedQuery(AttachmentsQuery, preloadedQuery);
  const environment = useRelayEnvironment();

  const saveAttachment = async (e) => {
    const variables = {
      input: {
        attachment: { file: e.target.files[0] },
      },
      connections: [query.allAttachments.__id],
    };
    await createAttachmentMutation(environment, variables);
  };

  return (
    <DefaultLayout session={query.session}>
      <h2>Attachments List</h2>
      <ul>
        {query.allAttachments.edges.map(({ node }, idx) => (
          <li
            key={`file-${idx}`}
            onClick={() => console.log("downloading:", node.file)}
          >
            {node.file}
          </li>
        ))}
      </ul>
      <FilePicker onChange={saveAttachment}>Upload</FilePicker>
    </DefaultLayout>
  );
}

export default withRelay(Attachments, AttachmentsQuery, withRelayOptions);
