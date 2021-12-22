import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery, useRelayEnvironment } from "react-relay";
import { attachmentsQuery } from "__generated__/attachmentsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import createAttachmentMutation from "mutations/attachment/createAttachment";
import { FilePicker } from "@button-inc/bcgov-theme";

const pageQuery = graphql`
  query attachmentsQuery($project: ID!) {
    session {
      ...DefaultLayout_session
    }
    project(id: $project) {
      projectName
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
`;

function ProjectAttachments({
  preloadedQuery,
}: RelayProps<{}, attachmentsQuery>) {
  const { session, project, allAttachments } = usePreloadedQuery(
    pageQuery,
    preloadedQuery
  );

  const environment = useRelayEnvironment();

  const saveAttachment = async (e) => {
    const variables = {
      input: {
        attachment: { file: e.target.files[0] },
      },
      connections: [allAttachments.__id],
    };
    await createAttachmentMutation(environment, variables);
  };
  return (
    <DefaultLayout session={session}>
      <h2>{project.projectName}</h2>
      <h3>Attachments List</h3>
      <ul>
        {allAttachments.edges.map(({ node }, idx) => (
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

export default withRelay(ProjectAttachments, pageQuery, withRelayOptions);
