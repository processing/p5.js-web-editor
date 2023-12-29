/* eslint-disable */
import s3 from '@auth0/s3';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/user';
import Project from '../models/project';
import async from 'async';
import { logger } from '../logger/winston.js';
require('dotenv').config({ path: path.resolve('.env') });
mongoose.connect('mongodb://localhost:27017/p5js-web-editor');
mongoose.connection.on('error', () => {
  logger.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

let client = s3.createClient({
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

const CHUNK = 100;
Project.count({}).exec().then((numProjects) => {
  logger.debug(numProjects);
  let index = 0;
  async.whilst(
    () => {
      return index < numProjects;
    },
    (whilstCb) => {
      Project.find({}).skip(index).limit(CHUNK).exec((err, projects) => {
        async.eachSeries(projects, (project, cb) => {
          if (!project.user) {
            cb();
            return;
          }
          const userId = project.user.valueOf();
          logger.debug(project.name);
          async.eachSeries(project.files, (file, fileCb) => {
            if (file.url && file.url.includes(process.env.S3_BUCKET) && !file.url.includes(userId)) {
              logger.debug(file.url, 'File URL: ');
              logger.debug(userId);
              const key = file.url.split('/').pop();
              logger.debug(key);
              const params = {
                Bucket: `${process.env.S3_BUCKET}`,
                CopySource: `${process.env.S3_BUCKET}/${key}`,
                Key: `${userId}/${key}`
              };
              try {
                client.moveObject(params)
                  .on('error', (err) => {
                    logger.error(err);
                    file.url = (process.env.S3_BUCKET_URL_BASE ||
                      `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}`) + `/${userId}/${key}`;
                    project.save((err, savedProject) => {
                      logger.debug(`updated file ${key}`);
                      fileCb();
                    });
                  })
                  .on('end', () => {
                    file.url = (process.env.S3_BUCKET_URL_BASE ||
                      `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}`) + `/${userId}/${key}`;
                    project.save((err, savedProject) => {
                      logger.debug(`updated file ${key}`);
                      fileCb();
                    });
                  });
              } catch (e) {
                logger.error(e);
                fileCb();
              }
            } else {
              fileCb();
            }
          }, () => {
            cb();
          });
        }, () => {
          index += CHUNK;
          whilstCb();
        });
      });
    },
    () => {
      logger.debug('finished processing all documents.');
      process.exit(0);
    }
  );
});
