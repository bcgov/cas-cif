import { screen } from "@testing-library/react";
import ProjectAttachmentsFormSummary from "components/Form/ProjectAttachmentsFormSummary";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query ProjectAttachmentsFormSummaryQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "I can be anything") {
        ...ProjectAttachmentsFormSummary_projectRevision
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
        summaryProjectAttachmentFormChanges: {
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

// We're using a wrapper component to avoid rendering errors with <td> elements
// not being in a table.
const TestWrapper: React.FC = (props: any) => {
  return (
    <table>
      <tbody>
        <ProjectAttachmentsFormSummary {...props} />
      </tbody>
    </table>
  );
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: TestWrapper,
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

  it("does not render the upload button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(
      screen.queryByLabelText("upload-attachment")
    ).not.toBeInTheDocument();
  });

  it("Displays all attachments", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/test-attachment-1.jpg/i)).toBeInTheDocument();
    expect(screen.getByText(/test-attachment-2.jpg/i)).toBeInTheDocument();
  });
});
