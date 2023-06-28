import { Router } from "express";
import { performQuery } from "./graphql";
import { Storage } from "@google-cloud/storage";
import config from "../../config";

export const attachmentDeleteRouter = Router();

const attachmentDetailsQuery = `query AttachmentDetailsQuery($attachmentId: ID!){
  attachment(id: $attachmentId) {
    file
  }
}`;

export const handleDelete = async (req, res, next) => {
  try {
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
        attachment: { file },
      },
    } = result;

    const storageClient = new Storage();
    const bucketName = config.get("attachmentsBucket");

    const response = await storageClient.bucket(bucketName).file(file).delete();

    return res.sendStatus(response[0].statusCode);
  } catch (error) {
    next(error);
  }
};

attachmentDeleteRouter.get("/delete/:attachmentId", handleDelete);
