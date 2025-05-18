const AWS = require('aws-sdk');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

exports.uploadImageByUrl = async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    console.log('Fetching image from:', imageUrl);
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    const fileName = `image-${uuidv4()}.jpg`;
    const bucket = process.env.S3_BUCKET;
    const key = `images/${fileName}`;

    const params = {
      Bucket: bucket,
      Key: key,
      Body: response.data,
      ContentType: response.headers['content-type'],
      ACL: 'public-read'
    };

    console.log('Uploading to S3:', { bucket, key });
    const uploadResult = await s3.upload(params).promise();

    const s3Url = uploadResult.Location;
    console.log('S3 upload success:', s3Url);

    return res.json({ s3Url });
  } catch (error) {
    console.error('Error uploading image:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
};
