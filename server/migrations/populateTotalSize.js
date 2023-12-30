/* eslint-disable */
import mongoose from 'mongoose';

import User from '../models/user';
import { listObjectsInS3ForUser } from '../controllers/aws.controller';
import { logger } from '../logger/winston';

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });
mongoose.connection.on('error', () => {
  logger.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

User.find({}, {}, { timeout: true }).cursor().eachAsync((user) => {
  logger.debug(user.id);
  if (user.totalSize !== undefined) {
    logger.debug('Already updated size for user: ' + user.username);
    return Promise.resolve();
  }
  return listObjectsInS3ForUser(user.id).then((objects) => {
    return User.findByIdAndUpdate(user.id, { $set: { totalSize: objects.totalSize } });
  }).then(() => {
    logger.debug('Updated new total size for user: ' + user.username);
  });
}).then(() => {
  logger.debug('Done iterating over every user');
  process.exit(0);
});