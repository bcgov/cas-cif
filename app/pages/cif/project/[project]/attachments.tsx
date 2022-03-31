import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay";
import { attachmentsQuery } from "__generated__/attachmentsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import Table from "components/Table";
import { NoHeaderFilter, TextFilter } from "components/Table/Filters";
import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import Link from "next/link";

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
      totalCount
      edges {
        node {
          file
          ...AttachmentTableRow_attachment
        }
      }
    }
  }
`;

const tableFilters = [
  new NoHeaderFilter(),
  new TextFilter("File Name", "fileName"),
  new TextFilter("Type", "type"),
  new TextFilter("Size", "size"),
  new TextFilter("Uploaded by", "uploadedBy"),
  new TextFilter("Status Added", "statusAdded"),
  new TextFilter("Received", "received"),
  new NoHeaderFilter(),
  new NoHeaderFilter(),
];

function ProjectAttachments({
  preloadedQuery,
}: RelayProps<{}, attachmentsQuery>) {
  const { session, project, allAttachments } = usePreloadedQuery(
    pageQuery,
    preloadedQuery
  );

  const isRedirecting = useRedirectTo404IfFalsy(project);
  if (isRedirecting) return null;

  return (
    <DefaultLayout session={session}>
      <h2>{project.projectName}</h2>
      <h3>Attachments List</h3>
      <Link
        href={{
          pathname: "/cif/project/[project]/upload-attachment",
          query: { project: project.id },
        }}
      >
        <a>Upload New Attachment</a>
      </Link>
      <Table
        paginated
        totalRowCount={allAttachments.totalCount}
        filters={tableFilters}
        pageQuery={pageQuery}
      >
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
