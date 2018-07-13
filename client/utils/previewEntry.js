import loopProtect from 'loop-protect';
import Hook from 'console-feed/lib/Hook/index';

window.loopProtect = loopProtect;

const consoleBuffer = [];
const LOGWAIT = 500;
Hook(window.console, (log) => {
  const { method, data: args } = log[0];
  consoleBuffer.push({
    method,
    arguments: args,
    source: 'sketch'
  });
});
setInterval(() => {
  if (consoleBuffer.length > 0) {
    window.parent.postMessage(consoleBuffer, '*');
    consoleBuffer.length = 0;
  }
}, LOGWAIT);
