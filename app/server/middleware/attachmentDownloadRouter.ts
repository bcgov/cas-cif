import { Router } from "express";
import { performQuery } from "./graphql";
import { Storage } from "@google-cloud/storage";
import config from "../../config";

const attachmentDownloadRouter = Router();

const attachmentDetailsQuery = `query AttachmentDetailsQuery($attachmentId: ID!){
  attachment(id: $attachmentId) {
    file
    fileName
    fileType
  }
}`;

attachmentDownloadRouter.get("/download/:attachmentId", async (req, res) => {
  const attachmentQueryVariables = {
    attachmentId: req.params.attachmentId,
  };

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
});

export default attachmentDownloadRouter;
