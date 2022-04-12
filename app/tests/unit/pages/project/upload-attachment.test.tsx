import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadAttachment } from "pages/cif/project/[project]/upload-attachment";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledUploadAttachmentQuery, {
  uploadAttachmentQuery,
} from "__generated__/uploadAttachmentQuery.graphql";

const defaultQueryResolver = {
  Query() {
    return {
      project: {
        id: "project-id-1",
        rowId: "1",
        projectName: "Test Project",
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<uploadAttachmentQuery>({
  pageComponent: UploadAttachment,
  compiledQuery: compiledUploadAttachmentQuery,
  defaultQueryResolver: defaultQueryResolver,
  defaultQueryVariables: { project: "test-cif-project" },
});

describe("The upload attachment page", () => {
  beforeEach(() => {
    jest.resetModules();
    pageTestingHelper.reinit();
  });
  it("Has an upload button that triggers an upload mutation", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    const testFile = new File(["O.o"], "eyes.jpg", { type: "image/jpeg" });

    const uploadButton = screen.getByLabelText("upload-attachment");
    userEvent.upload(uploadButton, testFile);

    const mutationCall =
      pageTestingHelper.environment.mock.getMostRecentOperation();

    expect(mutationCall.request.node.operation.name).toBe(
      "createAttachmentMutation"
    );
    expect(mutationCall.request).toMatchObject({
      variables: {
        input: {
          attachment: {
            file: expect.any(File),
            fileName: "eyes.jpg",
            fileSize: "3 Bytes",
            fileType: "image/jpeg",
            projectId: "1",
          },
        },
      },
    });
  });
});
