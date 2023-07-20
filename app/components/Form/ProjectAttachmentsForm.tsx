import { Button, FilePicker } from "@button-inc/bcgov-theme";
import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import LoadingSpinner from "components/LoadingSpinner";
import Table from "components/Table";
import { NoHeaderFilter, TextFilter } from "components/Table/Filters";
import bytesToSize from "lib/helpers/bytesToText";
import { useAddProjectAttachmentToRevision } from "mutations/attachment/addProjectAttachmentToRevision";
import { useCreateAttachment } from "mutations/attachment/createAttachment";
import { graphql, useFragment } from "react-relay";
import { ProjectAttachmentsForm_projectRevision$key } from "__generated__/ProjectAttachmentsForm_projectRevision.graphql";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";
import { useState } from "react";

const tableFilters = [
  new TextFilter("File Name", "fileName"),
  new TextFilter("Type", "type"),
  new TextFilter("Size", "size"),
  new TextFilter("Uploaded by", "uploadedBy"),
  new TextFilter("Received", "received"),
  new NoHeaderFilter(),
];

interface Props {
  projectRevision: ProjectAttachmentsForm_projectRevision$key;
  onSubmit?: () => void;
}

const ProjectAttachmentsForm: React.FC<Props> = ({
  projectRevision,
  onSubmit,
}) => {
  const brianna = useFragment(
    graphql`
      fragment ProjectAttachmentsForm_projectRevision on ProjectRevision {
        id
        rowId
        isFirstRevision
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
              asProjectAttachment {
                attachmentByAttachmentId {
                  ...AttachmentTableRow_attachment
                }
              }
            }
          }
        }
      }
    `,
    projectRevision
  );

  const [triggerRefresh, setTriggerRefresh] = useState(false);

  // brianna - this is infinite rendering but it doesn't seem to trigger relay anyway
  // useEffect(
  //   () => setTriggerRefresh && setTriggerRefresh(!triggerRefresh),
  //   [triggerRefresh]
  // );
  const { rowId, projectAttachmentFormChanges, isFirstRevision } = brianna;
  const attachmentFormChange = projectAttachmentFormChanges.edges[0]?.node;
  const [createAttachment, isCreatingAttachment] = useCreateAttachment();
  const [createProjectAttachment, isCreatingProjectAttachment] =
    useAddProjectAttachmentToRevision();
  const [stageFormChange] = useStageFormChange();

  const addProjectAttachment = async (attachmentId) => {
    await createProjectAttachment({
      variables: {
        input: {
          attachmentId,
          revisionId: rowId,
        },
        connections: [projectAttachmentFormChanges.__id],
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
        addProjectAttachment(data.createAttachment.attachment.rowId),
      onError: (err) => console.error(err),
    });
  };

  const handleStage = async () => {
    if (!attachmentFormChange) return null;
    return new Promise((resolve, reject) =>
      stageFormChange({
        variables: {
          input: {
            rowId: attachmentFormChange.rowId,
            formChangePatch: { newFormData: attachmentFormChange.newFormData },
          },
        },
        optimisticResponse: {
          stageFormChange: {
            formChange: {
              id: attachmentFormChange.id,
              changeStatus: "staged",
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
      })
    );
  };

  const handleClick = async () => {
    await handleStage();
    onSubmit();
  };

  return (
    <>
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
        totalRowCount={projectAttachmentFormChanges.totalCount}
        filters={tableFilters}
      >
        {projectAttachmentFormChanges.edges.map(({ node }) => {
          if (!node) return null;
          return (
            <AttachmentTableRow
              key={node.id}
              attachment={node.asProjectAttachment.attachmentByAttachmentId}
              formChangeRowId={node.rowId}
              connectionId={projectAttachmentFormChanges.__id}
              isFirstRevision={isFirstRevision}
              triggerRefresh={triggerRefresh}
              setTriggerRefresh={setTriggerRefresh}
            />
          );
        })}
      </Table>
      <Button
        type="submit"
        style={{ marginRight: "1rem" }}
        onClick={handleClick}
      >
        Submit Project Attachments
      </Button>
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
    </>
  );
};

export default ProjectAttachmentsForm;
