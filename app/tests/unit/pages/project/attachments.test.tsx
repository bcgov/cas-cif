import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectAttachments } from "pages/cif/project-revision/[projectRevision]/attachments";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledAttachmentsQuery, {
  attachmentsQuery,
} from "__generated__/attachmentsQuery.graphql";

const defaultQueryResolver = {
  Project() {
    return {
      id: "test-cif-project",
      rowId: 12345,
      projectName: "Test CIF Project",
      attachments: {
        __id: "test-attachments-connection!",
        totalCount: 2,
        edges: [
          {
            node: {
              file: "test-file-1",
              id: "test-attachment-1",
            },
          },
          {
            node: {
              file: "test-file-2",
              id: "test-attachment-2",
            },
          },
        ],
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<attachmentsQuery>({
  pageComponent: ProjectAttachments,
  compiledQuery: compiledAttachmentsQuery,
  defaultQueryResolver: defaultQueryResolver,
  defaultQueryVariables: { projectRevision: "test-cif-project-revision" },
});

describe("The project's attachment page", () => {
  beforeEach(() => {
    jest.resetModules();
    pageTestingHelper.reinit();
  });
  it("renders a table with all the attachments", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    // 5 rows: 1 header, 1 filter, 1 for the pagination, and 2 for the attachments
    expect(screen.getAllByRole("row")).toHaveLength(5);
  });

  // eslint-disable-next-line jest/expect-expect
  it("has a button to upload an attachment", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    const testFile = new File(["O.o"], "eyes.jpg", { type: "image/jpeg" });
    const uploadControl = screen.getByLabelText("upload-attachment");

    userEvent.upload(uploadControl, [testFile]);

    pageTestingHelper.expectMutationToBeCalled("createAttachmentMutation", {
      input: {
        attachment: {
          file: expect.any(File),
          fileName: "eyes.jpg",
          fileSize: "3 Bytes",
          fileType: "image/jpeg",
          projectId: 12345,
        },
      },
      connections: [
        'client:test-cif-project:__connection_attachments_connection(filter:{"archivedAt":{"equalTo":null}})',
      ],
    });
  });

  it("calls the archiveAttachmentMutation when the delete button is clicked", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    const deleteButton = screen.getAllByText("Delete")[0];
    deleteButton.click();

    pageTestingHelper.expectMutationToBeCalled("archiveAttachmentMutation", {
      connections: expect.any(Array),
      input: {
        id: "test-attachment-1",
        attachmentPatch: {
          archivedAt: expect.any(String),
        },
      },
    });
  });
});
