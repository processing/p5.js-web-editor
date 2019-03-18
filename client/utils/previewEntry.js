import * as Babel from '@babel/standalone';
import { Hook } from 'console-feed';

const protect = require('./loopProtect');

const consoleBuffer = [];
const LOGWAIT = 500;
const callback = (line) => {
  throw new Error(`Bad loop on line ${line}`);
};


Babel.registerPlugin('loopProtection', protect(LOGWAIT, callback));

const loopProtect = source => Babel.transform(source, {
  plugins: ['loopProtection'],
}).code;

module.exports = loopProtect;
