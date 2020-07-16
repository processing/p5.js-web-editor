import mongoose from 'mongoose';
import User from '../models/user';
import Project from '../models/project';
import Collection from '../models/collection';
import { moveObjectToUserInS3 } from '../controllers/aws.controller';
import mail from '../utils/mail';
import { renderAccountConsolidation } from '../views/mail';


const mongoConnectionString = process.env.MONGO_URL;
const { ObjectId } = mongoose.Types;
// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    $project: {
      email: {
        $toLower: [
          '$email'
        ]
      }
    }
  }, {
    $group: {
      _id: '$email',
      total: {
        $sum: 1
      }
    }
  }, {
    $match: {
      total: {
        $gt: 1
      }
    }
  }, {
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

let currentUser = null;
let duplicates = null;
User.aggregate(agg).then((result) => {
  console.log(result);
  const email = result[0]._id;
  return User.find({ email }).collation({ locale: 'en', strength: 2 })
    .sort({ createdAt: 1 }).exec();
}).then((result) => {
  [currentUser, ...duplicates] = result;
  console.log('Current User: ', currentUser._id, ' ', currentUser.email);
  duplicates = duplicates.map(dup => dup._id);
  console.log('Duplicates: ', duplicates);
  return Project.find({
    user: { $in: duplicates }
  }).exec();
}).then((sketches) => {
  const saveSketchPromises = [];
  sketches.forEach((sketch) => {
    const moveSketchFilesPromises = [];
    sketch.files.forEach((file) => {
      if (file.url && file.url.includes(process.env.S3_BUCKET_URL_BASE)) {
        const fileSavePromise = moveObjectToUserInS3(file.url, currentUser._id)
          .then((newUrl) => {
            file.url = newUrl;
          });
        moveSketchFilesPromises.push(fileSavePromise);
      }
    });
    const sketchSavePromise = Promise.all(moveSketchFilesPromises).then(() => {
      sketch.user = ObjectId(currentUser._id);
      return sketch.save();
    });
    saveSketchPromises.push(sketchSavePromise);
  });
  return Promise.all(saveSketchPromises);
}).then(() => {
  console.log('Moved and updated all sketches.');
  return Collection.updateMany(
    { owner: { $in: duplicates } },
    { $set: { owner: ObjectId(currentUser.id) } }
  );
}).then(() => {
  console.log('Moved and updated all collections.');
  return User.deleteMany({ _id: { $in: duplicates } });
}).then(() => {
  console.log('Deleted other user accounts.');
  currentUser.email = currentUser.email.toLowerCase();
  return currentUser.save();
}).then(() => {
  console.log('Migrated email to lowercase.');
  // const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const mailOptions = renderAccountConsolidation({
    body: {
      domain: 'https://editor.p5js.org',
      username: currentUser.username,
      email: currentUser.email
    },
    to: currentUser.email,
  });

  mail.send(mailOptions, (mailErr, result) => {
    console.log('Sent email.');
    process.exit(0);
  });
});

// ).then((result) => {
//   console.log(result);
// });

