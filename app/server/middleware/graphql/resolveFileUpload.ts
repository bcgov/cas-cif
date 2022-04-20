import config from "../../../config";

async function saveRemoteFile({ stream }) {
  const response = await fetch(
    `${config.get("storageApiHost")}/api/v1/attachments/upload`,
    {
      method: "POST",
      headers: {
        "api-key": config.get("storageApiKey"),
        "Content-Type": "multipart/form-data",
      },
      body: stream,
    }
  );
  try {
    return await response.json();
  } catch (e) {
    console.error(e);
  }
}

export default async function resolveFileUpload(upload) {
  const { createReadStream } = upload;
  const stream = createReadStream();

  // Save tile to remote storage system
  const { uuid } = await saveRemoteFile({ stream });

  return uuid;
}
