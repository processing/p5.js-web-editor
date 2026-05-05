import {
  s3Client,
  CopyObjectCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3';

export async function commitPendingFiles(files, userId) {
  if (!files) {
    return [];
  }

  const s3Base = process.env.S3_BUCKET_URL_BASE;
  const s3Bucket = process.env.S3_BUCKET;

  return Promise.all(
    files.map(async (file) => {
      if (!file.url || !file.url.startsWith(s3Base)) {
        return [];
      }

      const assetKey = decodeURIComponent(file.url.slice(s3Base.length));
      console.log('asset key: ', assetKey);

      if (!assetKey.startsWith(`pending/${userId}/`)) {
        return [];
      }

      const fileName = assetKey.split('/').pop();
      const newKey = `${userId}/${fileName}`;

      console.log('filename, newKey: ', fileName, newKey);

      await s3Client.send(
        new CopyObjectCommand({
          Bucket: s3Bucket,
          CopySource: `${s3Bucket}/${assetKey}`,
          Key: newKey,
          ACL: 'public-read'
        })
      );

      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: s3Bucket,
          Delete: { Objects: [{ Key: assetKey }] }
        })
      );

      return {
        ...file,
        url: `${s3Base}${newKey}`
      };
    })
  );
}

export default commitPendingFiles;
