import mongoose from 'mongoose';
import fs from 'fs';
import User from '../models/user';
import Project from '../models/project';
import Collection from '../models/collection';
import {
  moveObjectToUserInS3,
  copyObjectInS3
} from '../controllers/aws.controller';
import mail from '../utils/mail';
import { renderAccountConsolidation } from '../views/mail';

const mongoConnectionString = process.env.MONGO_URL;
const { ObjectId } = mongoose.Types;
// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(mongoConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('strictQuery', true);
mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Please make sure that MongoDB is running.'
  );
  process.exit(1);
});

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [ // eslint-disable-line
  {
    $project: {
      email: {
        $toLower: ['$email']
      }
    }
  },
  {
    $group: {
      _id: '$email',
      total: {
        $sum: 1
      }
    }
  },
  {
    $match: {
      total: {
        $gt: 1
      }
    }
  },
  {
    $sort: {
      total: -1
    }
  }
];

// steps to make this work
// iterate through the results
// check if any files are on AWS
// if so, move them to the right user bucket
// then, update the user to currentUser
// then, after updating all of the projects
// also update the collections
// delete other users
// update user email so it is all lowercase
// then, send the email
// then, figure out how to iterate through all of the users.

// create list of duplicate users
// User.aggregate(agg).then((result) => {
//   return fs.writeFile('duplicates.json', JSON.stringify(result), () => {
//     console.log('File written.');
//     process.exit(0);
//   });
// });

let currentUser = null;
let duplicates = null;

fs.readFile('duplicates.json', async (err, file) => {
  const result = JSON.parse(file);
  for (let i = 3000; i < result.length; i += 1) {
    console.log('Index: ', i);
    const email = result[i]._id;
    console.log(email);
    await consolidateAccount(email); // eslint-disable-line
  }
  process.exit(0);
});

async function consolidateAccount(email) {
  return User.find({ email })
    .collation({ locale: 'en', strength: 2 })
    .sort({ createdAt: 1 })
    .exec()
    .then((result) => {
      [currentUser, ...duplicates] = result;
      console.log('Current User: ', currentUser._id, ' ', currentUser.email);
      duplicates = duplicates.map((dup) => dup._id);
      console.log('Duplicates: ', duplicates);
      return Project.find({
        user: { $in: duplicates }
      }).exec();
    })
    .then((sketches) => {
      const saveSketchPromises = [];
      sketches.forEach((sketch) => {
        console.log('SketchId: ', sketch._id);
        console.log('UserId: ', sketch.user);
        const moveSketchFilesPromises = [];
        sketch.files.forEach((file) => {
          // if the file url contains sketch user
          if (
            file.url &&
            file.url.includes(process.env.S3_BUCKET_URL_BASE) &&
            !file.url.includes(currentUser._id)
          ) {
            if (file.url.includes(sketch.user)) {
              const fileSavePromise = moveObjectToUserInS3(
                file.url,
                currentUser._id
              )
                .then((newUrl) => {
                  file.url = newUrl;
                })
                .catch((err) => {
                  console.log('Move Error:');
                  console.log(err);
                });
              moveSketchFilesPromises.push(fileSavePromise);
            } else {
              const fileSavePromise = copyObjectInS3(file.url, currentUser._id)
                .then((newUrl) => {
                  file.url = newUrl;
                })
                .catch((err) => {
                  console.log('Copy Error:');
                  console.log(err);
                });
              moveSketchFilesPromises.push(fileSavePromise);
            }
          }
        });
        const sketchSavePromise = Promise.all(moveSketchFilesPromises).then(
          () => {
            sketch.user = ObjectId(currentUser._id);
            return sketch.save();
          }
        );
        saveSketchPromises.push(sketchSavePromise);
      });
      return Promise.all(saveSketchPromises);
    })
    .then(() => {
      console.log('Moved and updated all sketches.');
      return Collection.updateMany(
        { owner: { $in: duplicates } },
        { $set: { owner: ObjectId(currentUser.id) } }
      );
    })
    .then(() => {
      console.log('Moved and updated all collections.');
      return User.deleteMany({ _id: { $in: duplicates } });
    })
    .then(() => {
      console.log('Deleted other user accounts.');
      currentUser.email = currentUser.email.toLowerCase();
      return currentUser.save();
    })
    .then(() => {
      console.log('Migrated email to lowercase.');
      // const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const mailOptions = renderAccountConsolidation({
        body: {
          domain: 'https://editor.p5js.org',
          username: currentUser.username,
          email: currentUser.email
        },
        to: currentUser.email
      });

      return new Promise((resolve, reject) => {
        mail.send(mailOptions, (mailErr, result) => {
          console.log('Sent email.');
          if (mailErr) {
            return reject(mailErr);
          }
          return resolve(result);
        });
      });
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}

// let duplicates = [
//   "5ce3d936e0f9df0022d8330c",
//   "5cff843f091745001e83c070",
//     "5d246f5db489e6001eaee6e9"
// ];
// let currentUser = null;
// User.deleteMany({ _id: { $in: duplicates } }).then(() => {
//   return User.findOne({ "email": "Silverstar09@hotmail.com" })
// }).then((result) => {
//   currentUser = result;
//   console.log('Deleted other user accounts.');
//   currentUser.email = currentUser.email.toLowerCase();
//   return currentUser.save();
// }).then(() => {
//   const mailOptions = renderAccountConsolidation({
//     body: {
//       domain: 'https://editor.p5js.org',
//       username: currentUser.username,
//       email: currentUser.email
//     },
//     to: currentUser.email,
//   });

//   return new Promise((resolve, reject) => {
//     mail.send(mailOptions, (mailErr, result) => {
//       console.log('Sent email.');
//       if (mailErr) {
//         return reject(mailErr);
//       }
//       return resolve(result);
//     });
//   });
// });

// import s3 from '@auth0/s3';

// const client = s3.createClient({
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

// const headParams = {
//   Bucket: `${process.env.S3_BUCKET}`,
//   Key: "5c9de807f6bccf0017da7927/8b9d95ae-7ddd-452a-b398-672392c4ac43.png"
// };
// client.s3.headObject(headParams, (err, data) => {
//   console.log(err);
//   console.log(data);
// });
