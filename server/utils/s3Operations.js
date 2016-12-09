import s3 from 's3';
import each from 'async/each';

let client = s3.createClient({
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

export function deleteObjectsFromS3(urlList, callback) {
	if (urlList.length > 0) {
		let objectKeyList = [];
		each(urlList, (url) => {
			let objectKey = url.split("/").pop();
			objectKeyList.push({Key: objectKey})
		});
		let params = {
			Bucket: `${process.env.S3_BUCKET}`,
			Delete: {
				Objects: objectKeyList,
			},
		};
		let del = client.deleteObjects(params);
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
