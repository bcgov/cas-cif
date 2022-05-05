import { Storage } from "@google-cloud/storage";
import config from "../../../config";
import crypto from "crypto";

async function saveRemoteFile({ stream }) {
  const storageClient = new Storage();
  const bucketName = config.get("attachmentsBucket");
  const bucket = storageClient.bucket(bucketName);

  return new Promise<{ uuid: string }>((resolve, reject) => {
    const uuid = crypto.randomUUID();
    const file = bucket.file(uuid);
    const writeStream = file.createWriteStream();

    stream
      .pipe(writeStream)
      .on("finish", () => resolve({ uuid }))
      .on("error", (err) => reject(err));
  });
}

export default async function resolveFileUpload(upload) {
  const { createReadStream } = upload;
  const stream = createReadStream();

  // Save tile to remote storage system
  const { uuid } = await saveRemoteFile({ stream });

  return uuid;
}
