const express = require("express");

const attachmentDownloadRouter = express.Router();
const { PORT } = process.env;
const graphqlEndpoint = `http://localhost:${PORT || 3004}/graphql`;

attachmentDownloadRouter.get("/download/:attachmentId", async (req, res) => {
  const attachmentQueryBody = {
    operationName: "AttachmentDetailsQuery",
    query: `query AttachmentDetailsQuery($attachmentId: ID!){
      attachment(id: $attachmentId) {
        file
        fileName
        fileType
      }
    }`,
    variables: {
      attachmentId: req.params.attachmentId,
    },
  };

  console.log(attachmentQueryBody);
  console.log(graphqlEndpoint);

  const graphqlResult = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.get("Cookie"),
    },
    body: JSON.stringify(attachmentQueryBody),
  });

  const jsonResult = await graphqlResult.json();
  console.log(jsonResult);

  const {
    data: {
      attachment: { file, fileName, fileType },
    },
  } = jsonResult;

  const apiResult = await fetch(
    `${process.env.STORAGE_API_HOST}/api/v1/attachments/download/${file}`,
    {
      method: "GET",
      headers: {
        "api-key": process.env.STORAGE_API_KEY,
        "Accept-Encoding": "gzip",
      },
    }
  );

  console.log(apiResult.headers);

  res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
  res.setHeader("Content-Type", fileType);
  res.setHeader(
    "Content-Length",
    apiResult.headers.get("fastapi-content-length")
  );

  (apiResult.body as any).pipe(res);
});

// const downloadFile = async (uuid: string) => {
//   const response = await fetch(
//     `${process.env.STORAGE_API_HOST}/api/v1/attachments/download/${uuid}`,
//     {
//       method: "GET",
//       headers: {
//         "api-key": process.env.STORAGE_API_KEY,
//         "Accept-Encoding": "gzip",
//       },
//     }
//   );

//   console.log("*********** HEADERS **************");
//   console.log(response.headers);
//   try {
//     return response.arrayBuffer;
//   } catch (e) {
//     console.error(e);
//   }
// };

export default attachmentDownloadRouter;
