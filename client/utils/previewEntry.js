import loopProtect from 'loop-protect';
import { Hook, Decode, Encode } from 'console-feed';
import handleConsoleExpressions from './evaluateConsole';

window.loopProtect = loopProtect;

const consoleBuffer = [];
const LOGWAIT = 500;
Hook(window.console, (log) => {
  consoleBuffer.push({
    log
  });
});
setInterval(() => {
  if (consoleBuffer.length > 0) {
    const message = {
      messages: consoleBuffer,
      source: 'sketch'
    };
    // this could import dispatch instead! wowowowow
    window.parent.postMessage(message, window.origin);
    consoleBuffer.length = 0;
  }
}, LOGWAIT);

function handleMessageEvent(e) {
  if (window.origin !== e.origin) return;
  const { data } = e;
  const { source, messages } = data;
  if (source === 'console' && Array.isArray(messages)) {
    const decodedMessages = messages.map(message => Decode(message.log));
    decodedMessages.forEach((message) => {
      const { data: args } = message;
      //   let consoleInfo = '';
      //   const consoleBuffer = [];
      //   const LOGWAIT = 100;
      //   Hook(window.console, (log) => {
      //     consoleBuffer.push({
      //       log,
      //       source: 'sketch'
      //     });
      //   });
      //   setInterval(() => {
      //     if (consoleBuffer.length > 0) {
      //       window.postMessage(consoleBuffer, '*');
      //       consoleBuffer.length = 0;
      //     }
      //   }, LOGWAIT);
      const consoleInfo = handleConsoleExpressions(args);
      //   Unhook(window.console);
      //   if (!consoleInfo) {
      //     return false;
      //   }
      window.postMessage([{
        log: Encode({ method: 'result', data: Encode(consoleInfo) }),
        source: 'sketch'
      }], window.origin);
    });
  }
}

window.addEventListener('message', handleMessageEvent);
