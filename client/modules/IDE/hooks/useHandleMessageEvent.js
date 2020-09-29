import { useDispatch } from 'react-redux';
import { Decode } from 'console-feed';
import { isEqual } from 'lodash';
import { dispatchConsoleEvent } from '../actions/console';
import { stopSketch, expandConsole } from '../actions/console';

export default function useHandleMessageEvent() {
  const dispatch = useDispatch();

  const handleMessageEvent = (data) => {
    const { source, messages } = data;
    if (source === 'sketch' && Array.isArray(messages)) {
      const decodedMessages = messages.map(message => Decode(message.log));
      decodedMessages.every((message, index, arr) => {
        const { data: args } = message;
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
        // this should be done in the reducer probs
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
  };
  return handleMessageEvent;
}
