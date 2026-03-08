# S3 Bucket Configuration

This guide covers two options for S3 storage configuration:
- **[Option 1: MinIO (Local Development)](#minio-local-development)** - Recommended for local development
- **[Option 2: AWS S3 (Production)](#aws-s3-production)** - For production environments

## MinIO (Local Development)

MinIO is an S3-compatible object storage server that can run locally, making it ideal for development without needing AWS credentials or incurring cloud storage costs.

### Installation

Install `minio-client` from a package manager then, choose one of the following installation methods:

#### Option A: AUR (Arch Linux)
```bash
yay -S minio
```

#### Option B: Download Binary (Linux)
```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/
```

Visit [https://www.min.io/download](https://www.min.io/download) for other installation options.

### Setup

1. **Start MinIO server:**
```bash
minio server minio/ --console-address ":9090"
```

This will start MinIO and create the folder if it doesn't exist and outputs the following information:
- API endpoint (typically `http://127.0.0.1:9000`)
- WebUI (typically `http://127.0.0.1:9090`)
- Root credentials (default: `minioadmin` / `minioadmin`)

2. **Access the MinIO Web Console:**
   - Open your browser and navigate to `http://127.0.0.1:9090`
   - Login (default):
     - Username: `minioadmin`
     - Password: `minioadmin`

3. **Create a bucket:**
   - In the left panel, click "Create Bucket"
   - Enter bucket name: `p5js-editor`
   - Click "Create Bucket"

4. **Configure bucket access (Public Access):**
   - In your prefered terminal, configure the bucket to allow anonymous viewing `mcli anonymous set public local/p5js-editor`

5. **Update your `.env` file:**
```bash
# MinIO Configuration
AWS_ACCESS_KEY=minioadmin
AWS_SECRET_KEY=minioadmin
AWS_REGION=us-east-1
AWS_S3_ENDPOINT=http://127.0.0.1:9000
AWS_S3_SIGNATURE_VERSION=v4
S3_BUCKET=p5js-editor
S3_BUCKET_URL_BASE=http://127.0.0.1:9000/p5js-editor/
```

6. **Update S3 client configuration in code:**

The following files need to be updated to use MinIO locally:

**server/controllers/aws.controller.js:**
```javascript
const s3Client = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT || 'http://127.0.0.1:9000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  },
  region: process.env.AWS_REGION,
  forcePathStyle: true
});
```

**server/migrations/s3UnderUser.js:**
```javascript
const s3Client = new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT || 'http://127.0.0.1:9000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  },
  region: process.env.AWS_REGION,
  forcePathStyle: true
});
```

## AWS S3 (Production)

For production environments, use AWS S3:

1. [Create an S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html), with any name.
2. Navigate to the S3 bucket permissions and add the following CORS policy. This is for development only, as it allows CORS from any origin.
```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```
3. Uncheck "Block all public access" under "Block public access (bucket settings)".
4. In permissions, add the following bucket policy. Change "YOUR_BUCKET_NAME" to reflect name of the S3 bucket.
```
{
	"Version": "2008-10-17",
	"Id": "Policy1397632521960",
	"Statement": [
		{
			"Sid": "Stmt1397633323327",
			"Effect": "Allow",
			"Principal": {
				"AWS": "*"
			},
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::YOUR_BUCKET_NAME_HERE/*"
		}
	]
}
```
5. Under "Object Ownership", check "ACLs enabled" and set "Object Ownership" to "Object writer"
6. Locate your AWS key and Secret Key. You can find this in the top AWS navigation under your name -> Security Credentials.
7. Update the following lines to your .env file:
```
AWS_ACCESS_KEY={AWS_ACCESS_KEY}
AWS_REGION={S3_BUCKET_REGION}
AWS_SECRET_KEY={AWS_SECRET_KEY}
S3_BUCKET={S3_BUCKET_NAME}
S3_BUCKET_URL_BASE=https://{S3_BUCKET_NAME}.s3.{S3_BUCKET_REGION}.amazonaws.com/
```

If your S3 bucket is in the US East (N Virginia) region (us-east-1), you'll
need to set a custom URL base for it, because it does not follow the standard
naming pattern as the rest of the regions. Instead, add the following to your
environment/.env file, changing `BUCKET_NAME` to your bucket name. This is necessary because this override is currently treated as the full path to the bucket rather than as a proper base URL:
`S3_BUCKET_URL_BASE=https://s3.amazonaws.com/{BUCKET_NAME}/`

If you've configured your S3 bucket and DNS records to use a custom domain
name, you can also set it using this variable. I.e.:

`S3_BUCKET_URL_BASE=https://files.mydomain.com`

For more information on using a custom domain, see [this documentation link](http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html#VirtualHostingCustomURLs).
