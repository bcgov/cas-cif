import { Router } from "express";
import { performQuery } from "./graphql";
import { Storage } from "@google-cloud/storage";
import config from "../../config";

// export const brianna = (req, res, next) => {
export const attachmentDeleteRouter = Router();
console.log("attachmentDeleteRouter", attachmentDeleteRouter);

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
const handleDelete = async (req, res, next) => {
  console.log("************im in handle delete");
  console.log("req.header", req.header);
  try {
    const attachmentQueryVariables = {
      attachmentId: req.params.attachmentId,
    };
    const queryResponse = await performQuery(
      attachmentDetailsQuery,
      attachmentQueryVariables,
      req
    );
    console.log("queryResponse", queryResponse);
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

    // res.setHeader("X-CSRF-Token", document.cookie);
    console.log("!!!!!!!!!!!response[0].statusCode", response[0].statusCode);
    return res.sendStatus(response[0].statusCode);
  } catch (error) {
    next(error);
  }
};
attachmentDeleteRouter.delete("/delete/:attachmentId", handleDelete);

// attachmentDeleteRouter.delete(
//   "/delete/:attachmentId",
//   () =>
//     // {
//     //   console.log("*********about to handle delete");
//     //   handleDelete(req, res, next);
//     // }
//     handleDelete
// );
// next();
// };

// export const brianna = (req, res, next) => {
//   const attachmentDeleteRouter = Router();
//   console.log("attachmentDeleteRouter", attachmentDeleteRouter);

//   const attachmentDetailsQuery = `query AttachmentDetailsQuery($attachmentId: ID!){
//     attachment(id: $attachmentId) {
//       file
//       id
//     }
//   }`;

//   const discardProjectAttachmentFormChangeMutation = `mutation discardProjectAttachmentFormChangeMutation(
//     $input: DiscardProjectAttachmentFormChangeInput!
//   ) {
//     discardProjectAttachmentFormChange(input: $input) {
//       formChange {
//         id
//       }
//     }
//   }`;

//   const deleteAttachmentMutation = `mutation deleteAttachmentMutation($input: DeleteAttachmentInput!) {
//     deleteAttachment(input:$input){
//       attachment {
//         id
//       }
//     }
//   }
//   `;
//   const handleDelete = async (req, res, next) => {
//     console.log("************");
//     console.log("req.header", req.header);
//     try {
//       const attachmentQueryVariables = {
//         attachmentId: req.params.attachmentId,
//       };
//       const queryResponse = await performQuery(
//         attachmentDetailsQuery,
//         attachmentQueryVariables,
//         req
//       );

//       const {
//         data: {
//           attachment: { file, id },
//         },
//       } = queryResponse;
//       // delete the form_change related to the attachment
//       const attachmentFormChangeResponse = await performQuery(
//         discardProjectAttachmentFormChangeMutation,
//         req.body.variables,
//         req
//       );

//       // delete the attachment from the attachment table
//       const deleteAttachmentResponse = await performQuery(
//         deleteAttachmentMutation,
//         { input: { id } },
//         req
//       );

//       if (
//         queryResponse.errors ||
//         attachmentFormChangeResponse.errors ||
//         deleteAttachmentResponse.errors
//       ) {
//         throw new Error(`Failed to delete attachment`);
//       }

//       const storageClient = new Storage();
//       const bucketName = config.get("attachmentsBucket");

//       const response = await storageClient
//         .bucket(bucketName)
//         .file(file)
//         .delete();

//       // res.setHeader("X-CSRF-Token", document.cookie);
//       return res.sendStatus(response[0].statusCode);
//     } catch (error) {
//       next(error);
//     }
//   };
//   console.log("res.get", res.get("_csrf"));
//   console.log("res.getX-CSRF-Token", res.get("X-CSRF-Token"));
//   console.log("req.cookie", req.cookies);
//   console.log("req.headers", req.headers);
//   attachmentDeleteRouter.delete("/delete/:attachmentId", () => {
//     console.log("*******************in ");
//     return handleDelete(req, res, next);
//   });
// };
