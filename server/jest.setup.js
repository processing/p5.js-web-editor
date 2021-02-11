import '@babel/polyfill';
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
