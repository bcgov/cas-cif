import { Router } from "express";
import { performQuery } from "./graphql";
import { Storage } from "@google-cloud/storage";
import config from "../../config";

export const attachmentDeleteRouter = Router();

const attachmentDetailsQuery = `query AttachmentDetailsQuery($attachmentId: ID!){
    attachment(id: $attachmentId) {
      file
      id
    }
  }`;

const discardProjectAttachmentFormChangeMutation = `mutation discardProjectAttachmentFormChangeMutation(
    $input: DiscardProjectAttachmentFormChangeInput!
  ) {
    discardProjectAttachmentFormChange(input: $input) {
      formChange {
        id
      }
    }
  }`;

const deleteAttachmentMutation = `mutation deleteAttachmentMutation($input: DeleteAttachmentInput!) {
    deleteAttachment(input:$input){
      attachment {
        id
      }
    }
  }
  `;
export const handleDelete = async (req, res, next) => {
  try {
    const attachmentQueryVariables = {
      attachmentId: req.params.attachmentId,
    };
    const queryResponse = await performQuery(
      attachmentDetailsQuery,
      attachmentQueryVariables,
      req
    );

    const {
      data: {
        attachment: { file, id },
      },
    } = queryResponse;
    // delete the form_change related to the attachment
    const attachmentFormChangeResponse = await performQuery(
      discardProjectAttachmentFormChangeMutation,
      req.body.variables,
      req
    );

    // delete the attachment from the attachment table
    const deleteAttachmentResponse = await performQuery(
      deleteAttachmentMutation,
      { input: { id } },
      req
    );

    if (
      queryResponse.errors ||
      attachmentFormChangeResponse.errors ||
      deleteAttachmentResponse.errors
    ) {
      throw new Error(`Failed to delete attachment`);
    }

    const storageClient = new Storage();
    const bucketName = config.get("attachmentsBucket");

    const response = await storageClient.bucket(bucketName).file(file).delete();

    return res.sendStatus(response[0].statusCode);
  } catch (error) {
    next(error);
  }
};
attachmentDeleteRouter.delete("/delete/:attachmentId", handleDelete);
