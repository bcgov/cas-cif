async function saveRemoteFile({ stream }) {
  const response = await fetch(
    `${process.env.STORAGE_API_HOST}/api/v1/attachments/upload`,
    {
      method: "POST",
      headers: {
        "api-key": process.env.STORAGE_API_KEY,
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
