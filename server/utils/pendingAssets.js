import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  },
  region: process.env.AWS_REGION
});

function getPendingKeyFromUrl(url, userId) {
  const marker = `pending/${userId}/`;
  if (!url || !url.includes(marker)) {
    return null;
  }
  const filename = url.split('?')[0].split('/').pop();
  return `pending/${userId}/${filename}`;
}

export function rewritePendingFileUrls(files, userId) {
  const marker = `pending/${userId}/`;
  const replacement = `${userId}/`;
  return files.map((file) => {
    if (file.url && file.url.includes(marker)) {
      return Object.assign({}, file, {
        url: file.url.replace(marker, replacement)
      });
    }
    return file;
  });
}

async function moveAssetFromPending(pendingKey, userId) {
  const filename = pendingKey.split('/').pop();
  const destinationKey = `${userId}/${filename}`;

  await s3Client.send(
    new CopyObjectCommand({
      Bucket: process.env.S3_BUCKET,
      CopySource: `${process.env.S3_BUCKET}/${pendingKey}`,
      Key: destinationKey,
      ACL: 'public-read'
    })
  );

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET,
      Delete: { Objects: [{ Key: pendingKey }] }
    })
  );

  return destinationKey;
}

export async function commitPendingAssets(userId, files = []) {
  const pendingKeys = [
    ...new Set(
      files
        .map((file) => getPendingKeyFromUrl(file.url, userId))
        .filter(Boolean)
    )
  ];

  if (pendingKeys.length === 0) {
    return [];
  }

  return Promise.all(
    pendingKeys.map((key) => moveAssetFromPending(key, userId))
  );
}
