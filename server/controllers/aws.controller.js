import { v4 as uuidv4 } from 'uuid';
import S3Policy from 's3-policy-v4';
import {
  S3Client,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import { getProjectsForUserId } from './project.controller';
import User from '../models/user';

const { ObjectId } = mongoose.Types;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  },
  region: process.env.AWS_REGION
});

const s3Bucket =
  process.env.S3_BUCKET_URL_BASE ||
  `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}/`;

function getExtension(filename) {
  const i = filename.lastIndexOf('.');
  return i < 0 ? '' : filename.substr(i);
}

export function getObjectKey(url) {
  const urlArray = url.split('/');
  const objectKey = urlArray.pop();
  const userId = urlArray.pop();
  if (ObjectId.isValid(userId) && userId === new ObjectId(userId).toString()) {
    return `${userId}/${objectKey}`;
  }
  return objectKey;
}

export async function deleteObjectsFromS3(keyList) {
  const objectsToDelete = keyList?.map((key) => ({ Key: key }));

  if (objectsToDelete.length > 0) {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Delete: { Objects: objectsToDelete }
    };

    try {
      await s3Client.send(new DeleteObjectsCommand(params));
    } catch (error) {
      if (error instanceof TypeError) {
        return null;
      }
      console.error('Error deleting objects from S3: ', error);
      throw error;
    }
  }

  return objectsToDelete;
}

export async function deleteObjectFromS3(req, res) {
  const { objectKey, userId } = req.params;
  const fullObjectKey = userId ? `${userId}/${objectKey}` : objectKey;

  try {
    await deleteObjectsFromS3([fullObjectKey]);

    return res.json({ success: true, message: 'Object deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete object from s3.' });
  }
}

export function signS3(req, res) {
  const limit = process.env.UPLOAD_LIMIT || 250000000;
  if (req.user.totalSize > limit) {
    res
      .status(403)
      .send({ message: 'user has uploaded the maximum size of assets.' });
    return;
  }
  const fileExtension = getExtension(req.body.name);
  const filename = uuidv4() + fileExtension;
  const acl = 'public-read';
  const policy = S3Policy.generate({
    acl,
    key: `${req.body.userId}/${filename}`,
    bucket: process.env.S3_BUCKET,
    contentType: req.body.type,
    region: process.env.AWS_REGION,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
    metadata: []
  });
  res.json(policy);
}

export async function copyObjectInS3(url, userId) {
  const objectKey = getObjectKey(url);
  const fileExtension = getExtension(objectKey);
  const newFilename = uuidv4() + fileExtension;
  const headParams = {
    Bucket: process.env.S3_BUCKET,
    Key: objectKey
  };

  try {
    await s3Client.send(new HeadObjectCommand(headParams));
  } catch (error) {
    // temporary error handling for sketches with missing assets
    if (error instanceof TypeError) {
      return null;
    }
    console.error('Error retrieving object metadat:', error);
    throw error;
  }

  const params = {
    Bucket: process.env.S3_BUCKET,
    CopySource: `${process.env.S3_BUCKET}/${objectKey}`,
    Key: `${userId}/${newFilename}`,
    ACL: 'public-read'
  };

  try {
    await s3Client.send(new CopyObjectCommand(params));
  } catch (error) {
    // temporary error handling for sketches with missing assets
    if (error instanceof TypeError) {
      return null;
    }
    console.error('Error copying object:', error);
    throw error;
  }

  return `${s3Bucket}${userId}/${newFilename}`;
}

export async function copyObjectInS3RequestHandler(req, res) {
  try {
    const { url } = req.body;
    const newUrl = await copyObjectInS3(url, req.user.id);
    res.json({ url: newUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function moveObjectToUserInS3(url, userId) {
  const objectKey = getObjectKey(url);
  const fileExtension = getExtension(objectKey);
  const newFilename = uuidv4() + fileExtension;

  try {
    const headParams = {
      Bucket: process.env.S3_BUCKET,
      Key: objectKey
    };
    await s3Client.send(new HeadObjectCommand(headParams));
  } catch (headErr) {
    throw new Error(
      `Object with key ${process.env.S3_BUCKET}/${objectKey} does not exist.`
    );
  }

  const params = {
    Bucket: process.env.S3_BUCKET,
    CopySource: `${process.env.S3_BUCKET}/${objectKey}`,
    Key: `${userId}/${newFilename}`,
    ACL: 'public-read'
  };

  await s3Client.send(new CopyObjectCommand(params));
  return `${s3Bucket}${userId}/${newFilename}`;
}

export async function listObjectsInS3ForUser(userId) {
  try {
    let assets = [];
    const params = {
      Bucket: process.env.S3_BUCKET,
      Prefix: `${userId}/`
    };

    const data = await s3Client.send(new ListObjectsCommand(params));

    assets = data.Contents?.map((object) => ({
      key: object.Key,
      size: object.Size
    }));

    const projects = await getProjectsForUserId(userId);
    const projectAssets = [];
    let totalSize = 0;

    assets?.forEach((asset) => {
      const name = asset.key.split('/').pop();
      const foundAsset = {
        key: asset.key,
        name,
        size: asset.size,
        url: `${process.env.S3_BUCKET_URL_BASE}${asset.key}`
      };
      totalSize += asset.size;

      projects.some((project) => {
        let found = false;
        project.files.some((file) => {
          if (!file.url) return false;
          if (file.url.includes(asset.key)) {
            found = true;
            foundAsset.name = file.name;
            foundAsset.sketchName = project.name;
            foundAsset.sketchId = project.id;
            foundAsset.url = file.url;
            return true;
          }
          return false;
        });
        return found;
      });
      projectAssets.push(foundAsset);
    });

    return { assets: projectAssets, totalSize };
  } catch (error) {
    if (error instanceof TypeError) {
      return null;
    }
    console.error('Got an error: ', error);
    throw error;
  }
}

export async function listObjectsInS3ForUserRequestHandler(req, res) {
  const { username } = req.user;

  try {
    const user = await User.findByUsername(username);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const objects = await listObjectsInS3ForUser(user.id);
    res.json(objects);
  } catch (error) {
    console.error('Error listing objects in S3:', error.message);
    res.status(500).json({ error: 'Failed to list objects in S3' });
  }
}
