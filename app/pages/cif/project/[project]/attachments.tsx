import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay";
import { attachmentsQuery } from "__generated__/attachmentsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useCreateAttachment } from "mutations/attachment/createAttachment";
import { FilePicker } from "@button-inc/bcgov-theme";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";

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

  const [createAttachment] = useCreateAttachment();

  const isRedirecting = useRedirectTo404IfFalsy(project);
  if (isRedirecting) return null;

  const saveAttachment = async (e) => {
    createAttachment({
      variables: {
        input: {
          attachment: { file: e.target.files[0] },
        },
        connections: [allAttachments.__id],
      },
    });
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
