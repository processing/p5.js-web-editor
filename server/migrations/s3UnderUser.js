/* eslint-disable */
import {
  S3Client,
  CopyObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/user';
import Project from '../models/project';
import async from 'async';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });

async function main() {
  mongoose.connect('mongodb://localhost:27017/p5js-web-editor');
  mongoose.connection.on('error', () => {
    console.error(
      'MongoDB Connection Error. Please make sure that MongoDB is running.'
    );
    process.exit(1);
  });

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: process.env.AWS_REGION
  });

  const CHUNK = 100;
  const numProjects = await Project.count({}).exec();
  console.log(numProjects);
  let index = 0;

  while (index < numProjects) {
    const projects = await Project.find({}).skip(index).limit(CHUNK).exec();
    await async.eachSeries(projects, async (project) => {
      if (!project.user) {
        return;
      }
      const userId = project.user.valueOf();
      console.log(project.name);

      await async.eachSeries(project.files, async (file) => {
        if (
          file.url &&
          file.url.includes(process.env.S3_BUCKET) &&
          !file.url.includes(userId)
        ) {
          console.log(file.url);
          console.log(userId);
          const key = file.url.split('/').pop();
          console.log(key);
          const sourceKey = `${process.env.S3_BUCKET}/${key}`;
          const destinationKey = `${userId}/${key}`;

          const headParams = {
            Bucket: process.env.S3_BUCKET,
            Key: key
          };

          try {
            await s3Client.send(new HeadObjectCommand(headParams));
          } catch (headErr) {
            console.log(headErr);
            return;
          }

          const copyParams = {
            Bucket: process.env.S3_BUCKET,
            CopySource: sourceKey,
            Key: destinationKey
          };

          try {
            await s3Client.send(new CopyObjectCommand(copyParams));
            file.url =
              (process.env.S3_BUCKET_URL_BASE ||
                `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}`) +
              `/${userId}/${key}`;
            project.save((err, savedProject) => {
              console.log(`updated file ${key}`);
            });
          } catch (e) {
            console.log(e);
          }
        }
      });
    });
    index += CHUNK;
  }

  console.log('finished processing all documents.');
  process.exit(0);
}

main();
