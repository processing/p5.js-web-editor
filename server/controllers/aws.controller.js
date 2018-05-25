import uuid from 'node-uuid';
import policy from 's3-policy';
import s3 from 's3';
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
  if (urlArray.length === 6) {
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
  const objectKey = req.params.object_key;
  deleteObjectsFromS3([objectKey], () => {
    res.json({ success: true });
  });
}

export function signS3(req, res) {
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
  return res.json(result);
}

export function copyObjectInS3(req, res) {
  const { url } = req.body;
  const objectKey = getObjectKey(url);
  const fileExtension = getExtension(objectKey);
  const newFilename = uuid.v4() + fileExtension;
  const userId = req.user.id;
  const params = {
    Bucket: `${process.env.S3_BUCKET}`,
    CopySource: `${process.env.S3_BUCKET}/${objectKey}`,
    Key: `${userId}/${newFilename}`,
    ACL: 'public-read'
  };
  const copy = client.copyObject(params);
  copy.on('err', (err) => {
    console.log(err);
  });
  copy.on('end', (data) => {
    res.json({ url: `${s3Bucket}${userId}/${newFilename}` });
  });
}

export function listObjectsInS3ForUser(req, res) {
  let username;
  if (req.params) {
    username = req.params.username;
  } else {
    username = req.user.username;
  }
  findUserByUsername(username, (user) => {
    const userId = user.id;
    const params = {
      s3Params: {
        Bucket: `${process.env.S3_BUCKET}`,
        Prefix: `${userId}/`
      }
    };
    let assets = [];
    client.listObjects(params)
      .on('data', (data) => {
        assets = assets.concat(data.Contents.map(object => ({ key: object.Key, size: object.Size })));
      })
      .on('end', () => {
        const projectAssets = [];
        getProjectsForUserId(userId).then((projects) => {
          projects.forEach((project) => {
            project.files.forEach((file) => {
              if (!file.url) return;

              const foundAsset = assets.find(asset => file.url.includes(asset.key));
              if (!foundAsset) return;
              projectAssets.push({
                name: file.name,
                sketchName: project.name,
                sketchId: project.id,
                url: file.url,
                key: foundAsset.key,
                size: foundAsset.size
              });
            });
          });
          res.json({ assets: projectAssets });
        });
      });
  });
}
