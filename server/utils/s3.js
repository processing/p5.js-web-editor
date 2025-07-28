const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

exports.uploadToS3 = async (buffer, fileName, contentType) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  };

  try {
    const { Location } = await s3.upload(params).promise();
    return Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload to S3');
  }
};
