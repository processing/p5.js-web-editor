import uuid from 'node-uuid';
import policy from 's3-policy';
import s3 from '@auth0/s3';
import { getProjectsForUserId } from './project.controller';
import { findUserByUsername } from './user.controller';

const client = s3.createClient({
  maxAsyncS3: 20,
  s3RetryCount: 3,
  s3RetryDelay: 1000,
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
    secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
    region: `${process.env.AWS_REGION}`
  },
});

const s3Bucket = process.env.S3_BUCKET_URL_BASE ||
                 `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}/`;

function getExtension(filename) {
  const i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}

export function getObjectKey(url) {
  const urlArray = url.split('/');
  let objectKey;
  if (urlArray.length === 5) {
    const key = urlArray.pop();
    const userId = urlArray.pop();
    objectKey = `${userId}/${key}`;
  } else {
    const key = urlArray.pop();
    objectKey = key;
  }
  return objectKey;
}

export function deleteObjectsFromS3(keyList, callback) {
  const keys = keyList.map((key) => { return { Key: key }; }); // eslint-disable-line
  if (keyList.length > 0) {
    const params = {
      Bucket: `${process.env.S3_BUCKET}`,
      Delete: {
        Objects: keys,
      },
    };
    const del = client.deleteObjects(params);
    del.on('end', () => {
      if (callback) {
        callback();
      }
    });
  } else if (callback) {
    callback();
  }
}

export function deleteObjectFromS3(req, res) {
  const { objectKey, userId } = req.params;
  let fullObjectKey;
  if (userId) {
    fullObjectKey = `${userId}/${objectKey}`;
  } else {
    fullObjectKey = objectKey;
  }
  deleteObjectsFromS3([fullObjectKey], () => {
    res.json({ success: true });
  });
}

export function signS3(req, res) {
  const limit = process.env.UPLOAD_LIMIT || 250000000;
  if (req.user.totalSize > limit) {
    res.status(403).send({ message: 'user has uploaded the maximum size of assets.' });
    return;
  }
  const fileExtension = getExtension(req.body.name);
  const filename = uuid.v4() + fileExtension;
  const acl = 'public-read';
  const p = policy({
    acl,
    secret: process.env.AWS_SECRET_KEY,
    length: 5000000, // in bytes?
    bucket: process.env.S3_BUCKET,
    key: filename,
    expires: new Date(Date.now() + 60000),
  });
  const result = {
    AWSAccessKeyId: process.env.AWS_ACCESS_KEY,
    key: `${req.body.userId}/${filename}`,
    policy: p.policy,
    signature: p.signature
  };
  res.json(result);
}

export function copyObjectInS3(url, userId) {
  return new Promise((resolve, reject) => {
    const objectKey = getObjectKey(url);
    const fileExtension = getExtension(objectKey);
    const newFilename = uuid.v4() + fileExtension;
    const headParams = {
      Bucket: `${process.env.S3_BUCKET}`,
      Key: `${objectKey}`
    };
    client.s3.headObject(headParams, (headErr) => {
      if (headErr) {
        reject(new Error(`Object with key ${process.env.S3_BUCKET}/${objectKey} does not exist.`));
        return;
      }
      const params = {
        Bucket: `${process.env.S3_BUCKET}`,
        CopySource: `${process.env.S3_BUCKET}/${objectKey}`,
        Key: `${userId}/${newFilename}`,
        ACL: 'public-read'
      };
      const copy = client.copyObject(params);
      copy.on('err', (err) => {
        reject(err);
      });
      copy.on('end', (data) => {
        resolve(`${s3Bucket}${userId}/${newFilename}`);
      });
    });
  });
}

export function copyObjectInS3RequestHandler(req, res) {
  const { url } = req.body;
  copyObjectInS3(url, req.user.id).then((newUrl) => {
    res.json({ url: newUrl });
  });
}

export function moveObjectToUserInS3(url, userId) {
  return new Promise((resolve, reject) => {
    const objectKey = getObjectKey(url);
    const fileExtension = getExtension(objectKey);
    const newFilename = uuid.v4() + fileExtension;
    const headParams = {
      Bucket: `${process.env.S3_BUCKET}`,
      Key: `${objectKey}`
    };
    client.s3.headObject(headParams, (headErr) => {
      if (headErr) {
        reject(new Error(`Object with key ${process.env.S3_BUCKET}/${objectKey} does not exist.`));
        return;
      }
      const params = {
        Bucket: `${process.env.S3_BUCKET}`,
        CopySource: `${process.env.S3_BUCKET}/${objectKey}`,
        Key: `${userId}/${newFilename}`,
        ACL: 'public-read'
      };
      const move = client.moveObject(params);
      move.on('err', (err) => {
        reject(err);
      });
      move.on('end', (data) => {
        resolve(`${s3Bucket}${userId}/${newFilename}`);
      });
    });
  });
}

export function listObjectsInS3ForUser(userId) {
  let assets = [];
  return new Promise((resolve) => {
    const params = {
      s3Params: {
        Bucket: `${process.env.S3_BUCKET}`,
        Prefix: `${userId}/`
      }
    };
    client.listObjects(params)
      .on('data', (data) => {
        assets = assets.concat(data.Contents.map(object => ({ key: object.Key, size: object.Size })));
      })
      .on('end', () => {
        resolve();
      });
  }).then(() => getProjectsForUserId(userId)).then((projects) => {
    const projectAssets = [];
    let totalSize = 0;
    assets.forEach((asset) => {
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
    return Promise.resolve({ assets: projectAssets, totalSize });
  }).catch((err) => {
    console.log('got an error');
    console.log(err);
  });
}

export function listObjectsInS3ForUserRequestHandler(req, res) {
  const { username } = req.user;
  findUserByUsername(username, (user) => {
    const userId = user.id;
    listObjectsInS3ForUser(userId).then((objects) => {
      res.json(objects);
    });
  });
}
