import uuid from 'node-uuid';
import policy from 's3-policy';

function getExtension(filename) {
  const i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}

export function signS3(req, res) {
  const fileExtension = getExtension(req.body.name),
    filename = uuid.v4() + fileExtension,
    acl = 'public-read',
    p = policy({
      acl,
      secret: process.env.AWS_SECRET_KEY,
      length: 5000000, // in bytes?
      bucket: process.env.S3_BUCKET,
      key: filename,
      expires: new Date(Date.now() + 60000),
    }),
    result = {
      'AWSAccessKeyId': process.env.AWS_ACCESS_KEY,
      'key': filename,
      'policy': p.policy,
      'signature': p.signature
    };
  return res.json(result);
}
