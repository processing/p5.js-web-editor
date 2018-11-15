import loopProtect from 'loop-protect';
import { Hook } from 'console-feed';

window.loopProtect = loopProtect;

const consoleBuffer = [];
const LOGWAIT = 500;
Hook(window.console, (log) => {
  consoleBuffer.push({
    log,
    source: 'sketch' 
  });
});
setInterval(() => {
  if (consoleBuffer.length > 0) {
    window.parent.postMessage(consoleBuffer, '*');
    consoleBuffer.length = 0;
  }
}, LOGWAIT);
