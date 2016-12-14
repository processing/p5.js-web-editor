import mongoose from 'mongoose';
import path from 'path';
import { uniqWith, isEqual } from 'lodash';
require('dotenv').config({path: path.resolve('.env')});
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect('mongodb://localhost:27017/p5js-web-editor');
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

import Project from '../models/project';
import User from '../models/user';

import s3 from 's3';

let client = s3.createClient({
  maxAsyncS3: 20,
  s3RetryCount: 3,
  s3RetryDelay: 1000,
  multipartUploadThreshold: 20971520, // this is the default (20 MB) 
  multipartUploadSize: 15728640, // this is the default (15 MB) 
  s3Options: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
    secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
    region: 'us-west-2'
  },
});

let s3Files = [];

Project.find({})
  .exec((err, projects) => {
    projects.forEach((project, projectIndex) => {
      project.files.forEach((file, fileIndex) => {
        if (file.url && !file.url.includes("https://rawgit.com/")) {
          s3Files.push(file.url.split('/').pop());
        }
      });
    });
    console.log(s3Files.length);
    s3Files = uniqWith(s3Files, isEqual);
    console.log(s3Files.length);
  });

const uploadedFiles = [];
const params = {'s3Params': {'Bucket': `${process.env.S3_BUCKET}`}};
let objectsResponse = client.listObjects(params);
objectsResponse.on('data', function(objects) {
  objects.Contents.forEach(object => {
    uploadedFiles.push(object.Key);
  });
});

const filesToDelete = [];
objectsResponse.on('end', () => {
  console.log(uploadedFiles.length);
  uploadedFiles.forEach(fileKey => {
    if (s3Files.indexOf(fileKey) === -1) {
      //delete file
      filesToDelete.push({Key: fileKey});
      // console.log("would delete file: ", fileKey);
    }
  });
  let params = {
    Bucket: `${process.env.S3_BUCKET}`,
    Delete: {
      Objects: filesToDelete,
    },
  };
  let del = client.deleteObjects(params);
  del.on('err', (err) => {
    console.log(err);
  });
  del.on('end', () => {
    console.log('deleted extra S3 files!');
  });
  console.log("To delete: ", filesToDelete.length);
  console.log("Total S3 files: ", uploadedFiles.length);
  console.log("Total S3 files in mongo: ", s3Files.length);
});

// let projectsNotToUpdate;
// Project.find({'files.name': 'root'})
//   .exec((err, projects) => {
//     projectsNotToUpdate = projects.map(project => project.id);
//     console.log(projectsNotToUpdate);

//     Project.find({})
//       .exec((err, projects) => {
//         projects.forEach( (project, projectIndex) => {
//           if (!projectsNotToUpdate.find(projectId => projectId === project.id)) {
//             const childIdArray = project.files.map(file => file._id.valueOf());
//             const newId = new ObjectId();
//             project.files.push({
//               name: 'root',
//               _id: newId,
//               id: newId,
//               fileType: 'folder',
//               children: childIdArray,
//               content: ''
//             });

//             project.files = project.files.map(file => {
//               if (file.name === "sketch.js") {
//                 file.isSelected = true;
//                 return file;
//               }
//               return file;
//             });
//             project.save((err, savedProject) => {
//               console.log('project', projectIndex, 'is saved.');
//             });
//           }
//         });
//       });
//   });

// Project.find({'files.name': 'root'})
//   .exec((err, projects) => {
//     projects.forEach((project, projectIndex) => {
//       project.files = project.files.map(file => {
//         if (file.name === "sketch.js") {
//           file.isSelected = true;
//           return file;
//         } else if (file.name === "root") {
//           file.content = '';
//           return file;
//         }
//         return file;
//       });

//       project.save((err, savedProject) => {
//         console.log('project', projectIndex, 'is saved.');
//       });
//     });
//   });

// const s3Bucket = `http://p5.js-webeditor.s3.amazonaws.com/`;
// const s3BucketHttps = `https://s3-us-west-2.amazonaws.com/p5.js-webeditor/`;

// Project.find({})
//   .exec((err, projects) => {
//     projects.forEach((project, projectIndex) => {
//       project.files.forEach((file) => {
//         if (file.url) {
//           file.url = file.url.replace(s3Bucket, s3BucketHttps);
//           console.log('Updating', file.name);
//           console.log(file.url);
//         }
//       });
//       project.save((err, savedProject) => {
//         console.log('project', projectIndex, 'is saved.');
//       });
//     });
//   });

// Project.find({})
//   .exec((err, projects) => {
//     projects.forEach((project, projectIndex) => {
//       project.files.forEach((file) => {
//         if (file.isSelected) {
//           delete file.isSelected;
//         }

//         if (file.name === 'sketch.js') {
//           file.isSelectedFile = true;
//           console.log(file.name, 'is now selected');
//           // file.save((err, savedFile) => {
//           //   console.log('file saved');
//           // });
//         } else {
//           file.isSelectedFile = false;
//         }
//         // console.log('project', projectIndex);
//         // if (file.isSelected) {
//         //   console.log('is selected remains');
//         // }

//         // if (file.isSelctedFile) {
//         //   console.log('changed to isSelected file');
//         // }
//         project.save((err, savedProject) => {
//           console.log('project', projectIndex, 'is saved.');
//         });

//       });
//     });
//   });

// User.findOne({email: 'test@test.com'})
//   .exec((err, user) => {
//     console.log(user);
//     user.password = '1234';
//     user.save((err, savedUser) => {
//       console.log('user saved');
//     });
//   });

// User.find({})
//   .exec((err, users) => {
//     users.forEach(user => {
//       user.preferences.autorefresh = false;
//       user.save((err, savedUser) => {
//         console.log('user saved');
//       });
//     });
//   });
