import { Router } from "express";

const attachmentDownloadRouter = Router();
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

  const graphqlResult = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.get("Cookie"),
    },
    body: JSON.stringify(attachmentQueryBody),
  });

  const jsonResult = await graphqlResult.json();

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

export default attachmentDownloadRouter;
