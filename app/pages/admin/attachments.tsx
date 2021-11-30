import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { useMutation } from "react-relay";
import FilePicker from "@button-inc/bcgov-theme/FilePicker";

import { createAttachmentMutation } from "mutations/attachment/createAttachment";
import { attachmentsQuery } from "__generated__/attachmentsQuery.graphql";

import withRelayOptions from "lib/relay/withRelayOptions";

const AttachmentsQuery = graphql`
  query attachmentsQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      allAttachments {
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
  const [commit] = useMutation(createAttachmentMutation);
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
      <FilePicker
        onChange={(e) => {
          commit({
            variables: {
              input: {
                attachment: { file: e.target.files[0] },
              },
            },
            onCompleted(data) {
              console.log(data);
            },
          });
        }}
      >
        Upload
      </FilePicker>
    </DefaultLayout>
  );
}

export default withRelay(Attachments, AttachmentsQuery, withRelayOptions);
