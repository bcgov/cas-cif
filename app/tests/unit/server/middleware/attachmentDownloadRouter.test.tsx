/**
 * @jest-environment node
 */
import { mocked } from "jest-mock";
import { Storage } from "@google-cloud/storage";
import { performQuery } from "server/middleware/graphql";

import attachmentDownloadRouter, {
  handleDownload,
} from "server/middleware/attachmentDownloadRouter";
import config from "config";

jest.mock("config", () => ({
  get: jest.fn(),
}));

const mockGetMetadata = jest.fn();
const mockReadStream = { pipe: jest.fn() };
const mockFile = jest.fn().mockImplementation(() => ({
  getMetadata: mockGetMetadata,
  createReadStream: jest.fn().mockReturnValue(mockReadStream),
}));
const mockBucket = jest.fn().mockImplementation(() => ({ file: mockFile }));

jest.mock("@google-cloud/storage");
mocked(Storage).mockImplementation(() => ({ bucket: mockBucket } as any));

jest.mock("server/middleware/graphql");
mocked(performQuery).mockImplementation(() => {
  return {
    data: {
      attachment: {
        file: "fileUuid",
        fileName: "testFileName.extension",
        fileType: "mime/testfiletype",
      },
    },
  } as any;
});

describe("The attachment download router", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it("is configured properly", () => {
    const routerUnderTest = attachmentDownloadRouter;

    expect(routerUnderTest.stack).toHaveLength(1);
    expect(routerUnderTest.stack[0].route.path).toBe("/download/:attachmentId");
    expect(attachmentDownloadRouter.stack[0].route.stack[0].handle).toBe(
      handleDownload
    );
  });

  it("pipes the storage client's file to the response and sets the right headers", async () => {
    const handlerUnderTest = handleDownload;

    (config.get as any).mockImplementation((item: string) =>
      item === "attachmentsBucket" ? "testBucket" : ""
    );

    mockGetMetadata.mockReturnValue([{ size: 123456 }]);

    const testExpressRes = {
      setHeader: jest.fn(),
    };
    const testExpressReq = { params: { attachmentId: "123" } };

    await handlerUnderTest(testExpressReq, testExpressRes);

    // 1. The response has the right headers set

    expect(testExpressRes.setHeader).toHaveBeenCalledTimes(3);
    expect(testExpressRes.setHeader).toHaveBeenNthCalledWith(
      1,
      "Content-Length",
      123456
    );
    expect(testExpressRes.setHeader).toHaveBeenNthCalledWith(
      2,
      "Content-Disposition",
      "attachment; filename=testFileName.extension"
    );
    expect(testExpressRes.setHeader).toHaveBeenNthCalledWith(
      3,
      "Content-Type",
      "mime/testfiletype"
    );

    // 2. The storage client's file's pipe method has been called with the response object
    expect(mockReadStream.pipe).toHaveBeenCalledWith(testExpressRes);
  });
});
