# S3 Bucket Configuration
1. [Create an S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html), with any name
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
3. In permissions, add the following bucket policy. Change "YOUR_BUCKET_NAME" to reflect name of the S3 bucket.
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
4. Uncheck "Block all public access" under "Block public access (bucket settings)".
5. Under "Object Ownership", check "ACLs enabled" and set "Object Ownership" to "Object writer"
6. Locate your AWS key and Secret Key. You can find this in the top AWS navigation under your name -> Security Credentials.
7. Update the following lines to your .env file:
```
AWS_ACCESS_KEY={AWS_ACCESS_KEY}
AWS_REGION={S3_BUCKET_REGION}
AWS_SECRET_KEY={AWS_SECRET_KEY}
S3_BUCKET={S3_BUCKET_NAME}
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
