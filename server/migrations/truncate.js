/* eslint-disable */
import mongoose from 'mongoose';
import slugify from 'slugify';

const dotenv = require('dotenv');
dotenv.config();

import Project from '../models/project';

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, {
  useMongoClient: true
});
mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Please make sure that MongoDB is running.'
  );
  process.exit(1);
});

Project.find(
  {},
  {},
  {
    timeout: true
  }
)
  .cursor()
  .eachAsync((project) => {
    console.log(project.name);
    if (project.name.length < 256) {
      console.log('Project name is okay.');
      return Promise.resolve();
    }
    project.name = project.name.substr(0, 255);
    project.slug = slugify(project.name, '_');
    return project.save().then(() => {
      console.log('Updated sketch slug to: ' + project.slug);
    });
  })
  .then(() => {
    console.log('Done iterating over every sketch.');
    process.exit(0);
  });
