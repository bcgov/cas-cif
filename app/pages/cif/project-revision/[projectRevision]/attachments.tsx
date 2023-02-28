import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay";
import { attachmentsQuery } from "__generated__/attachmentsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import Table from "components/Table";
import { NoHeaderFilter, TextFilter } from "components/Table/Filters";
import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import TaskList from "components/TaskList";
import { FilePicker } from "@button-inc/bcgov-theme";
import { useCreateAttachment } from "mutations/attachment/createAttachment";
import bytesToSize from "lib/helpers/bytesToText";
import LoadingSpinner from "components/LoadingSpinner";

const pageQuery = graphql`
  query attachmentsQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      project: projectByProjectId {
        projectName
        rowId
        attachments: attachmentsByProjectId(
          first: 2147483647
          filter: { archivedAt: { equalTo: null } }
        ) @connection(key: "connection_attachments") {
          __id
          totalCount
          edges {
            node {
              file
              ...AttachmentTableRow_attachment
            }
          }
        }
      }
      ...TaskList_projectRevision
    }
  }
`;

const tableFilters = [
  new TextFilter("File Name", "fileName"),
  new TextFilter("Type", "type"),
  new TextFilter("Size", "size"),
  new TextFilter("Uploaded by", "uploadedBy"),
  new TextFilter("Received", "received"),
  new NoHeaderFilter(),
];

export function ProjectAttachments({
  preloadedQuery,
}: RelayProps<{}, attachmentsQuery>) {
  const { session, projectRevision } = usePreloadedQuery(
    pageQuery,
    preloadedQuery
  );

  const [createAttachment, isCreatingAttachment] = useCreateAttachment();

  const isRedirecting = useRedirectTo404IfFalsy(projectRevision);
  if (isRedirecting) return null;

  const saveAttachment = async (e) => {
    const file = e.target.files[0];
    const variables = {
      input: {
        attachment: {
          file: file,
          fileName: file.name,
          fileSize: bytesToSize(file.size),
          fileType: file.type,
          projectId: projectRevision.project.rowId,
        },
      },
      connections: [projectRevision.project.attachments.__id],
    };
    createAttachment({
      variables,
      onError: (err) => console.error(err),
    });
  };

  const taskList = <TaskList projectRevision={projectRevision} mode={"view"} />;

  return (
    <DefaultLayout session={session} leftSideNav={taskList}>
      <h2>{projectRevision.project.projectName}</h2>
      <h3>Attachments List</h3>
      {isCreatingAttachment ? (
        <div>
          <div className="loadingSpinnerContainer">
            <LoadingSpinner></LoadingSpinner>
            <span>Uploading file...</span>
          </div>
        </div>
      ) : (
        <FilePicker onChange={saveAttachment} name={"upload-attachment"}>
          Upload New Attachment
        </FilePicker>
      )}
      <Table
        paginated
        totalRowCount={projectRevision.project.attachments.totalCount}
        filters={tableFilters}
        pageQuery={pageQuery}
      >
        {projectRevision.project.attachments.edges.map(({ node }) => (
          <AttachmentTableRow key={node.file} attachment={node} />
        ))}
      </Table>
      <style jsx>{`
        header > section {
          display: flex;
          justify-content: space-between;
        }
        .loadingSpinnerContainer {
          display: flex;
        }
        .loadingSpinnerContainer > span {
          margin: auto 0.5em;
        }
        div :global(div.spinner) {
          margin: 0;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectAttachments, pageQuery, withRelayOptions);
