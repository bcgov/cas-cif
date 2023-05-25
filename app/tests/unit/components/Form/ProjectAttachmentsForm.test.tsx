import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import ProjectAttachmentsForm from "components/Form/ProjectAttachmentsForm";
import { graphql } from "react-relay";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query ProjectAttachmentsFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "I can be anything") {
        ...ProjectAttachmentsForm_projectRevision
      }
    }
  }
`;

const defaultQueryResolver = {
  Query() {
    return {
      projectRevision: {
        rowId: 12345,
        project: {
          projectName: "Test CIF Project",
          rowId: 1,
        },
        projectAttachmentFormChanges: {
          __id: "test-attachment-form-change-connection-id",
          totalCount: 2,
          edges: [
            {
              node: {
                id: "test-attachment-form-change-id-1",
                rowId: 1,
                asProjectAttachment: {
                  attachmentByAttachmentId: {
                    id: "test-attachment-id-1",
                    fileName: "test-attachment-1.jpg",
                    fileType: "image/jpeg",
                    fileSize: 123456,
                    createdAt: "2021-01-01T00:00:00.000Z",
                    cifUserByCreatedBy: {
                      fullName: "Test User",
                    },
                  },
                },
              },
            },
            {
              node: {
                id: "test-attachment-form-change-id-2",
                rowId: 2,
                asProjectAttachment: {
                  attachmentByAttachmentId: {
                    id: "test-attachment-id-2",
                    fileName: "test-attachment-2.jpg",
                    fileType: "image/jpeg",
                    fileSize: 123456,
                    createdAt: "2021-01-02T00:00:00.000Z",
                    cifUserByCreatedBy: {
                      fullName: "Test User 2",
                    },
                  },
                },
              },
            },
          ],
        },
      },
    };
  },
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectAttachmentsForm,
  testQuery: testQuery,
  compiledQuery: compiledFormIndexPageQuery,
  getPropsFromTestQuery: (data) => ({
    query: data.query,
    projectRevision: data.query.projectRevision,
  }),
  defaultQueryResolver: defaultQueryResolver,
  defaultQueryVariables: { projectRevision: "mock-id" },
});

describe("The project's attachment page", () => {
  beforeEach(() => {
    jest.resetModules();
    componentTestingHelper.reinit();
  });
  it("renders a table with all the attachments", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // 5 rows: 1 header, 1 filter, 1 for the pagination, and 2 for the attachments
    expect(screen.getAllByRole("row")).toHaveLength(5);
  });

  // eslint-disable-next-line jest/expect-expect
  it("has a button to upload an attachment", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const testFile = new File(["O.o"], "eyes.jpg", { type: "image/jpeg" });
    const uploadControl = screen.getByLabelText("upload-attachment");

    act(() => userEvent.upload(uploadControl, [testFile]));

    componentTestingHelper.expectMutationToBeCalled(
      "createAttachmentMutation",
      {
        input: {
          attachment: {
            file: expect.any(File),
            fileName: "eyes.jpg",
            fileSize: "3 Bytes",
            fileType: "image/jpeg",
          },
        },
      }
    );
  });
});
