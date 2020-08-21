import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Decode, Encode, Hook, Unhook } from 'console-feed';
import { isEqual } from 'lodash';
import { dispatchConsoleEvent } from '../actions/console';
import { stopSketch, expandConsole } from '../actions/console';
import handleConsoleExpressions from '../../../utils/evaluateConsole';

function useMessageEvent(callback) {
  useEffect(() => {
    window.addEventListener('message', callback);
    return () => window.removeEventListener('message', callback);
  }, [callback]);
}

function MessageHandler() {
  const dispatch = useDispatch();

  const handleMessageEvent = useCallback((messageEvent) => {
    if (messageEvent.origin !== window.origin) return;
    if (Array.isArray(messageEvent.data)) {
      const decodedMessages = messageEvent.data.map(message => Object.assign(
        Decode(message.log),
        { source: message.source }
      ));
      decodedMessages.every((message, index, arr) => {
        const { data: args, source } = message;
        if (source === 'console') {
          let consoleInfo = '';
          const consoleBuffer = [];
          const LOGWAIT = 100;
          Hook(window.console, (log) => {
            consoleBuffer.push({
              log,
              source: 'sketch'
            });
          });
          setInterval(() => {
            if (consoleBuffer.length > 0) {
              window.postMessage(consoleBuffer, '*');
              consoleBuffer.length = 0;
            }
          }, LOGWAIT);
          consoleInfo = handleConsoleExpressions(args);
          Unhook(window.console);
          if (!consoleInfo) {
            return false;
          }
          window.postMessage([{
            log: Encode({ method: 'result', data: Encode(consoleInfo) }),
            source: 'sketch'
          }], '*');
        }
        let hasInfiniteLoop = false;
        Object.keys(args).forEach((key) => {
          if (typeof args[key] === 'string' && args[key].includes('Exiting potential infinite loop')) {
            dispatch(stopSketch());
            dispatch(expandConsole());
            hasInfiniteLoop = true;
          }
        });
        if (hasInfiniteLoop) {
          return false;
        }
        if (index === arr.length - 1) {
          Object.assign(message, { times: 1 });
          return false;
        }
        const cur = Object.assign(message, { times: 1 });
        const nextIndex = index + 1;
        while (isEqual(cur.data, arr[nextIndex].data) && cur.method === arr[nextIndex].method) {
          cur.times += 1;
          arr.splice(nextIndex, 1);
          if (nextIndex === arr.length) {
            return false;
          }
        }
        return true;
      });

      dispatch(dispatchConsoleEvent(decodedMessages));
    }
  });

  useMessageEvent(handleMessageEvent);
  return null;
}

export default MessageHandler;
