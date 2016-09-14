import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect('mongodb://localhost:27017/p5js-web-editor');
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

import Project from '../models/project';

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

Project.find({})
  .exec((err, projects) => {
    projects.forEach((project, projectIndex) => {
      project.files.forEach((file) => {
        if (file.isSelected) {
          delete file.isSelected;
        }

        if (file.name === 'sketch.js') {
          file.isSelectedFile = true;
          delete file.isSelected;
          console.log(file);
          // file.save((err, savedFile) => {
          //   console.log('file saved');
          // });
        } else {
          file.isSelectedFile = false;
        }
        // console.log('project', projectIndex);
        // if (file.isSelected) {
        //   console.log('is selected remains');
        // }

        // if (file.isSelctedFile) {
        //   console.log('changed to isSelected file');
        // }
        project.save((err, savedProject) => {
          console.log('project', projectIndex, 'is saved.');
        });

      });
    });
  });



