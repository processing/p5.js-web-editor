import mongoose from 'mongoose';
import User from '../models/user';
import Project from '../models/project';
import Collection from '../models/collection';
import { moveObjectToUserInS3 } from '../controllers/aws.controller';


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

let currentUser = null;
let duplicates = null;
User.aggregate(agg).then((result) => {
  const email = result[0]._id;
  return User.find({ email }).collation({ locale: 'en', strength: 2 })
    .sort({ createdAt: 1 }).exec();
}).then((result) => {
  [currentUser, ...duplicates] = result;
  duplicates = duplicates.map(dup => dup._id);
  console.log(duplicates);
  return Project.find({
    user: { $in: duplicates }
  }).exec();
}).then((sketches) => {
  const saveSketchPromises = [];
  sketches.forEach((sketch) => {
    const moveSketchFilesPromises = [];
    sketch.files.forEach((file) => {
      if (file.url.includes('assets.editor.p5js.org')) {
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
  // iterate through the results
  // check if any files are on AWS
  // if so, move them to the right user bucket
  // then, update the user to currentUser
  // then, after updating all of the projects
  // also update the collections
  // delete other users
  // update user email so it is all lowercase
  // then, send the email
}).then(() => Collection.updateMany(
  { owner: { $in: duplicates } },
  { $set: { owner: ObjectId(currentUser.id) } }
)).then(() => User.deleteMany({ _id: { $in: duplicates } })).catch((err) => {
  console.log(err);
});

