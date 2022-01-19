import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay";
import { attachmentsQuery } from "__generated__/attachmentsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Button from "@button-inc/bcgov-theme/Button";
import Table from "components/Table";
import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import { getAttachmentUploadPageRoute } from "pageRoutes";
import { useRouter } from "next/router";

const pageQuery = graphql`
  query attachmentsQuery($project: ID!) {
    session {
      ...DefaultLayout_session
    }
    project(id: $project) {
      id
      projectName
    }
    allAttachments(first: 2147483647)
      @connection(key: "connection_allAttachments") {
      __id
      edges {
        node {
          file
          ...AttachmentTableRow_attachment
        }
      }
    }
  }
`;

const tableColumns = [
  { title: "Description" },
  { title: "File Name" },
  { title: "Type" },
  { title: "Size" },
  { title: "Uploaded by" },
  { title: "Status Added" },
  { title: "Flag for Review" },
  { title: "Received" },
  { title: "Actions" },
];

function ProjectAttachments({
  preloadedQuery,
}: RelayProps<{}, attachmentsQuery>) {
  const { session, project, allAttachments } = usePreloadedQuery(
    pageQuery,
    preloadedQuery
  );

  const router = useRouter();

  const goToUploadView = async () => {
    await router.push(getAttachmentUploadPageRoute(project.id));
  };

  return (
    <DefaultLayout session={session}>
      <h2>{project.projectName}</h2>
      <h3>Attachments List</h3>
      <Button role="button" onClick={goToUploadView}>
        Upload New Attachment
      </Button>
      <Table columns={tableColumns}>
        {allAttachments.edges.map(({ node }) => (
          <AttachmentTableRow key={node.file} attachment={node} />
        ))}
      </Table>
      <style jsx>{`
        header > section {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectAttachments, pageQuery, withRelayOptions);
