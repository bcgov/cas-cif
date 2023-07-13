import { act, screen } from "@testing-library/react";
import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import hardDeleteAttachment from "components/Attachment/hardDeleteAttachement";
import { mocked } from "jest-mock";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledAttachmentTableRowTestQuery, {
  AttachmentTableRowTestQuery,
} from "__generated__/AttachmentTableRowTestQuery.graphql";
import { AttachmentTableRow_attachment$data } from "__generated__/AttachmentTableRow_attachment.graphql";
jest.mock("components/Attachment/hardDeleteAttachement");

const testQuery = graphql`
  query AttachmentTableRowTestQuery @relay_test_operation {
    query {
      attachment(id: "test-attachment") {
        ...AttachmentTableRow_attachment
      }
    }
  }
`;

const mockPayload = {
  Attachment() {
    const result: AttachmentTableRow_attachment$data = {
      " $fragmentType": "AttachmentTableRow_attachment",
      id: "Cif Test Attachment ID",
      fileName: "test.jpg",
      fileType: "image/jpeg",
      fileSize: "123.45 TB",
      createdAt: "2019-01-01",
      cifUserByCreatedBy: {
        fullName: "Cif User",
      },
    };
    return result;
  },
};

// We're using a wrapper component to avoid rendering errors with <td> elements
// not being in a table.
const TestWrapper: React.FC = (props: any) => {
  return (
    <table>
      <tbody>
        <AttachmentTableRow {...props} />
      </tbody>
    </table>
  );
};

const defaultComponentProps = { isFirstRevision: false };

const componentTestingHelper =
  new ComponentTestingHelper<AttachmentTableRowTestQuery>({
    component: TestWrapper,
    compiledQuery: compiledAttachmentTableRowTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockPayload,
    getPropsFromTestQuery: (data) => ({
      attachment: data.query.attachment,
      formChangeRowId: "test-form-change-row-id",
      connectionId: "test-attachment-form-change-connection-id",
    }),
    defaultComponentProps,
  });

describe("The Attachment table row component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("displays the right information", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("test.jpg")).toBeInTheDocument();
    expect(screen.getByText("image/jpeg")).toBeInTheDocument();
    expect(screen.getByText("123.45 TB")).toBeInTheDocument();
    expect(screen.getByText("Cif User")).toBeInTheDocument();
    expect(screen.getByText("2019-01-01")).toBeInTheDocument();
  });

  it("hides the delete button when hideDelete prop is true", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(undefined, { hideDelete: true });

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("has a working download button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const downloadButton = screen.getByText("Download");
    downloadButton.click();

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/download/Cif%20Test%20Attachment%20ID",
      expect.anything(),
      expect.anything()
    );
  });
  it("calls the discardProjectAttachmentFormChangeMutation when the delete button is clicked and it is not the first revision", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const deleteButton = screen.getAllByText("Delete")[0];
    act(() => deleteButton.click());

    componentTestingHelper.expectMutationToBeCalled(
      "discardProjectAttachmentFormChangeMutation",
      {
        input: {
          formChangeId: "test-form-change-row-id",
        },
        connections: ["test-attachment-form-change-connection-id"],
      }
    );
  });
  it("hits the delete endpoint when the delete button is clicked if it's the first revision", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(undefined, {
      ...defaultComponentProps,
      isFirstRevision: true,
    });
    const mockHardDelete = jest.fn();
    mocked(hardDeleteAttachment).mockImplementation(mockHardDelete);

    const deleteButton = screen.getAllByText("Delete")[0];
    act(() => deleteButton.click());

    expect(mockHardDelete).toHaveBeenCalled();
  });
});
