import mongoose from 'mongoose';
import fs from 'fs';
import { User } from '../models/user';
import Project from '../models/project';
import Collection from '../models/collection';
import {
  moveObjectToUserInS3,
  copyObjectInS3
} from '../controllers/aws.controller';
import { mailerService } from '../utils/mail';
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
        mailerService.send(mailOptions, (mailErr, result) => {
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
