import { Router } from "express";
import { performQuery } from "./graphql";
import { Storage } from "@google-cloud/storage";
import config from "../../config";

const attachmentDownloadRouter = Router();

// this would be a graphql mutation deleting the file. AttachmentDetailsDeleteMutation
// add some documentationv
const attachmentDetailsQuery = `query AttachmentDetailsQuery($attachmentId: ID!){
  attachment(id: $attachmentId) {
    file
    fileName
    fileType
  }
}`;

export const handleDownload = async (req, res, next) => {
  const attachmentQueryVariables = {
    attachmentId: req.params.attachmentId,
  };

  try {
    const result = await performQuery(
      attachmentDetailsQuery,
      attachmentQueryVariables,
      req
    );

    const {
      data: {
        attachment: { file, fileName, fileType },
      },
    } = result;

    const storageClient = new Storage();
    const bucketName = config.get("attachmentsBucket");

    const [metadata] = await storageClient
      .bucket(bucketName)
      .file(file)
      .getMetadata();

    res.setHeader("Content-Length", metadata.size);
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
    res.setHeader("Content-Type", fileType);

    await storageClient
      .bucket(bucketName)
      .file(file)
      .createReadStream()
      .pipe(res);
  } catch (error) {
    next(error);
  }
};
// whichever route makes the most sense, readability
attachmentDownloadRouter.get("/download/:attachmentId", handleDownload);

export default attachmentDownloadRouter;
