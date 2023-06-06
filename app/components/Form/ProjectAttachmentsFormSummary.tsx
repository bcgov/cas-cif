import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import Table from "components/Table";
import { NoHeaderFilter, TextFilter } from "components/Table/Filters";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectAttachmentsFormSummary_projectRevision$key } from "__generated__/ProjectAttachmentsFormSummary_projectRevision.graphql";
import { FormNotAddedOrUpdated } from "./SummaryFormCommonComponents";

const tableFilters = [
  new TextFilter("File Name", "fileName"),
  new TextFilter("Type", "type"),
  new TextFilter("Size", "size"),
  new TextFilter("Uploaded by", "uploadedBy"),
  new TextFilter("Received", "received"),
  new NoHeaderFilter(),
];

interface Props {
  projectRevision: ProjectAttachmentsFormSummary_projectRevision$key;
  isOnAmendmentsAndOtherRevisionsPage?;
  viewOnly?: boolean;
}

const ProjectAttachmentsFormSummary: React.FC<Props> = ({
  projectRevision,
  isOnAmendmentsAndOtherRevisionsPage,
  viewOnly,
}) => {
  const revision = useFragment(
    graphql`
      fragment ProjectAttachmentsFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        rowId
        summaryProjectAttachmentFormChanges: formChangesFor(
          first: 500
          formDataTableName: "project_attachment"
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_summaryProjectAttachmentFormChanges") {
          __id
          totalCount
          edges {
            node {
              id
              rowId
              newFormData
              isPristine
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

  const attachmentsSummary =
    revision.summaryProjectAttachmentFormChanges.edges[0]?.node;

  const projectAttachmentsFormNotUpdated = useMemo(
    () =>
      !attachmentsSummary ||
      attachmentsSummary?.isPristine ||
      (attachmentsSummary?.isPristine === null &&
        Object.keys(attachmentsSummary?.newFormData).length === 0),
    [attachmentsSummary]
  );

  if (isOnAmendmentsAndOtherRevisionsPage && projectAttachmentsFormNotUpdated)
    return null;

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && <h3>Project Attachments</h3>}
      {projectAttachmentsFormNotUpdated && !viewOnly ? (
        !isOnAmendmentsAndOtherRevisionsPage ? (
          <FormNotAddedOrUpdated
            isFirstRevision={revision.isFirstRevision}
            formTitle="Project Attachments"
          />
        ) : (
          ""
        )
      ) : (
        <Table
          paginated
          totalRowCount={
            revision.summaryProjectAttachmentFormChanges.totalCount
          }
          filters={tableFilters}
        >
          {revision.summaryProjectAttachmentFormChanges.edges.map(
            ({ node }) => (
              <AttachmentTableRow
                key={node.id}
                attachment={node.asProjectAttachment.attachmentByAttachmentId}
                formChangeRowId={node.rowId}
                connectionId={revision.summaryProjectAttachmentFormChanges.__id}
                hideDelete={true}
              />
            )
          )}
        </Table>
      )}

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

export default ProjectAttachmentsFormSummary;
