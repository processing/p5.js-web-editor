import {
  S3Client,
  CopyObjectCommand,
  ListObjectsCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  },
  region: process.env.AWS_REGION
});

const STALE_ASSET_TIME = 5;

async function getPendingAssets(userId) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Prefix: `pending/${userId}/`
  };

  try {
    const data = await s3Client.send(new ListObjectsCommand(params));
    return data.Contents || [];
  } catch (error) {
    console.error('Error listing pending assets from S3:', error);
    throw error;
  }
}

async function getStalePendingAssets(minutesOld = STALE_ASSET_TIME) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Prefix: 'pending/'
  };

  try {
    const data = await s3Client.send(new ListObjectsCommand(params));
    if (!data.Contents) return [];

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutesOld);

    return data.Contents.filter(
      (object) => object.LastModified < cutoffTime
    ).map((object) => object.Key);
  } catch (error) {
    console.error('Error listing stale pending assets from S3:', error);
    throw error;
  }
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

async function deleteKeys(keys) {
  if (keys.length === 0) return;

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET,
      Delete: { Objects: keys.map((key) => ({ Key: key })) }
    })
  );
}

export async function commitPendingAssets(userId) {
  try {
    const assets = await getPendingAssets(userId);
    if (assets.length === 0) return [];

    const movePromises = assets.map((asset) =>
      moveAssetFromPending(asset.Key, userId)
    );
    return Promise.all(movePromises);
  } catch (error) {
    console.error('Error committing pending assets:', error);
    throw error;
  }
}

export async function cleanupStalePendingAssets() {
  try {
    const staleKeys = await getStalePendingAssets();
    if (staleKeys.length > 0) {
      await deleteKeys(staleKeys);
    }
  } catch (error) {
    console.error('Error cleaning up stale pending assets:', error);
  }
}
