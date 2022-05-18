import { screen } from "@testing-library/react";
import AttachmentTableRow from "components/Attachment/AttachmentTableRow";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledAttachmentTableRowTestQuery, {
  AttachmentTableRowTestQuery,
} from "__generated__/AttachmentTableRowTestQuery.graphql";
import { AttachmentTableRow_attachment } from "__generated__/AttachmentTableRow_attachment.graphql";

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
    const result: AttachmentTableRow_attachment = {
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

const componentTestingHelper =
  new ComponentTestingHelper<AttachmentTableRowTestQuery>({
    component: TestWrapper,
    compiledQuery: compiledAttachmentTableRowTestQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockPayload,
    getPropsFromTestQuery: (data) => ({ attachment: data.query.attachment }),
  });

describe("The Attachment table row component", () => {
  beforeEach(() => {
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
  it("has a working view button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const viewButton = screen.getByText("View");
    viewButton.click();

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/attachments/[attachment]?attachment=Cif+Test+Attachment+ID",
      expect.anything(),
      expect.anything()
    );
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
});
