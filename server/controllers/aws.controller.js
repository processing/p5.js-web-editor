import uuid from 'node-uuid';
import policy from 's3-policy';
import s3 from 's3';

const client = s3.createClient({
  maxAsyncS3: 20,
  s3RetryCount: 3,
  s3RetryDelay: 1000,
  multipartUploadThreshold: 20971520, // this is the default (20 MB) 
  multipartUploadSize: 15728640, // this is the default (15 MB) 
  s3Options: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
    secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
  },
});

const s3Bucket = `https://s3-us-west-2.amazonaws.com/${process.env.S3_BUCKET}/`;

function getExtension(filename) {
  const i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}

export function deleteObjectsFromS3(keyList, callback) {
  const keys = keyList.map((key) => { return {Key: key}; });
  if (keyList.length > 0) {
    const params = {
      Bucket: `${process.env.S3_BUCKET}`,
      Delete: {
        Objects: keys,
      },
    };
    const del = client.deleteObjects(params);
    del.on('end', function() {
      if(callback) {
        callback();
      }
    });
  } else {
    if(callback) {
      callback();
    }
  }
}

export function deleteObjectFromS3(req, res) {
  const objectKey = req.params.object_key;
  deleteObjectsFromS3([objectKey], function() {
    res.json({ success:true });
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
    key: filename,
    policy: p.policy,
    signature: p.signature
  };
  return res.json(result);
}

export function copyObjectInS3(req, res) {
  const url = req.body.url;
  const objectKey = url.split("/").pop();

  const fileExtension = getExtension(objectKey);
  const newFilename = uuid.v4() + fileExtension;
  const params = {
    Bucket: `${process.env.S3_BUCKET}`,
    CopySource: `${process.env.S3_BUCKET}/${objectKey}`,
    Key: newFilename
  };
  const copy = client.copyObject(params);
  copy.on('end', function() {
    res.json({url: `${s3Bucket}${newFilename}`});
  });
}
