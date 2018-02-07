/* eslint-disable */
import s3 from 's3';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/user';
import Project from '../models/project';
import async from 'async';
require('dotenv').config({path: path.resolve('.env')});
mongoose.connect('mongodb://localhost:27017/p5js-web-editor');
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

// let client = s3.createClient({
//   maxAsyncS3: 20,
//   s3RetryCount: 3,
//   s3RetryDelay: 1000,
//   multipartUploadThreshold: 20971520, // this is the default (20 MB) 
//   multipartUploadSize: 15728640, // this is the default (15 MB) 
//   s3Options: {
//     accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
//     secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
//     region: `${process.env.AWS_REGION}`
//   },
// });

const CHUNK = 100;
Project.count({})
.exec().then((numProjects) => {
  console.log(numProjects);
  let index = 0;
  async.whilst(
    () => {
      return index < numProjects;
    },
    (whilstCb) => {
      Project.find({}).skip(index).limit(CHUNK).exec((err, projects) => {
        async.eachSeries(projects, (project, cb) => {
          console.log(project.name);
          async.eachSeries(project.files, (file, fileCb) => {
            if (file.url && file.url.includes('s3-us-west-2.amazonaws.com/')) {
              file.url = file.url.replace('s3-us-west-2.amazonaws.com/', '');
              project.save((err, newProject) => {
                console.log(`updated file ${file.url}`);
                fileCb();
              });
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
      console.log('finished processing all documents.')
      process.exit(0); 
    }
  );
});
