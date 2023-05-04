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
import { useAddProjectAttachmentToRevision } from "mutations/attachment/addProjectAttachmentToRevision";

const AttachmentsQuery = graphql`
  query attachmentsQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      rowId
      project: projectByProjectId {
        projectName
        rowId
      }
      projectAttachmentFormChanges: formChangesFor(
        first: 500
        formDataTableName: "project_attachment"
        filter: { operation: { notEqualTo: ARCHIVE } }
      ) @connection(key: "connection_projectAttachmentFormChanges") {
        __id
        totalCount
        edges {
          node {
            id
            rowId
            newFormData
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
    AttachmentsQuery,
    preloadedQuery
  );
  const [createAttachment, isCreatingAttachment] = useCreateAttachment();
  const [addProjectAttachment, isCreatingProjectAttachment] =
    useAddProjectAttachmentToRevision();

  const isRedirecting = useRedirectTo404IfFalsy(projectRevision);
  if (isRedirecting) return null;

  const addProjectAttachmentFormChange = async (attachmentId) => {
    await addProjectAttachment({
      variables: {
        input: {
          projectId: projectRevision.project.rowId,
          attachmentId,
          revisionId: projectRevision.rowId,
        },
        connections: [projectRevision.projectAttachmentFormChanges.__id],
      },
    });
  };

  const saveAttachment = async (e) => {
    const file = e.target.files[0];
    await createAttachment({
      variables: {
        input: {
          attachment: {
            file,
            fileName: file.name,
            fileSize: bytesToSize(file.size),
            fileType: file.type,
          },
        },
      },
      onCompleted: (data) =>
        addProjectAttachmentFormChange(data.createAttachment.attachment.rowId),
      onError: (err) => console.error(err),
    });
  };

  const taskList = <TaskList projectRevision={projectRevision} mode={"view"} />;

  return (
    <DefaultLayout session={session} leftSideNav={taskList}>
      <h2>{projectRevision.project.projectName}</h2>
      <h3>Attachments List</h3>
      {isCreatingAttachment || isCreatingProjectAttachment ? (
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
        totalRowCount={projectRevision.projectAttachmentFormChanges.totalCount}
        filters={tableFilters}
        pageQuery={AttachmentsQuery}
      >
        {projectRevision.projectAttachmentFormChanges.edges.map(({ node }) => (
          <AttachmentTableRow
            key={node.id}
            attachmentRowId={node.newFormData?.attachmentId}
            formChangeRowId={node.rowId}
            connectionId={projectRevision.projectAttachmentFormChanges.__id}
          />
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

export default withRelay(
  ProjectAttachments,
  AttachmentsQuery,
  withRelayOptions
);
