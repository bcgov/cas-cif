import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import Table from "components/Table";
import { NoHeaderFilter, TextFilter } from "components/Table/Filters";
import { graphql, useFragment } from "react-relay";
import { ProjectAttachmentsFormSummary_projectRevision$key } from "__generated__/ProjectAttachmentsFormSummary_projectRevision.graphql";
import { FormNotAddedOrUpdated } from "./SummaryFormCommonComponents";
import { useEffect, useMemo } from "react";

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
  setHasDiff?: (hasDiff: boolean | ((prevState: boolean) => void)) => void;
}

const ProjectAttachmentsFormSummary: React.FC<Props> = ({
  projectRevision,
  isOnAmendmentsAndOtherRevisionsPage,
  viewOnly,
  setHasDiff,
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
              operation
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

  // Show diff if it is not view only
  const renderDiff = !viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived contacts
  let attachmentFormChanges =
    revision.summaryProjectAttachmentFormChanges.edges;
  if (!renderDiff)
    attachmentFormChanges =
      revision.summaryProjectAttachmentFormChanges.edges.filter(
        ({ node }) => node.operation !== "ARCHIVE"
      );

  const projectAttachmentsFormNotUpdated = useMemo(
    () =>
      !attachmentFormChanges.some(
        ({ node }) =>
          node.isPristine === false ||
          (node.isPristine === null && node.newFormData?.attachmentId !== null)
      ),
    [attachmentFormChanges]
  );

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!projectAttachmentsFormNotUpdated),
    [projectAttachmentsFormNotUpdated, setHasDiff]
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
