/* eslint-disable */
import s3 from 's3';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/user';
import Project from '../models/project';
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

const CHUNK = 1000;
Project.count({})
.exec().then(async (numProjects) => {
  console.log(numProjects);
  for (let i = 0; i < numProjects; i += CHUNK) {
    let projects = await Project.find({}).skip(i).limit(CHUNK).exec();
    projects.forEach((project, projectIndex) => {
      console.log(project.name);
      project.files.forEach((async file, fileIndex) => {
        if (file.url && file.url.includes('p5.js-webeditor')) {
          file.url = file.url.replace('p5.js-webeditor', process.env.S3_BUCKET);
        }
        let savedProject = await project.save();
        console.log(`updated file ${file.url}`);
        process.exit(0);
      });
    });
  }
});

// Project.find({}, (err, projects) => {
//   projects.forEach((project, projectIndex) => {
//     console.log(project.name);
//     project.files.forEach((file, fileIndex) => {
//       if (file.url && file.url.includes('p5.js-webeditor')) {
//         file.url = file.url.replace('p5.js-webeditor', process.env.S3_BUCKET);
//       }
//       project.save((err, savedProject) => {
//         console.log(`updated file ${file.url}`);
//         process.exit(0);
//       });
//     });
//   });
// });