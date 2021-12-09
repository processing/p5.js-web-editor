import { useDispatch } from 'react-redux';
import { Decode } from 'console-feed';
import { dispatchConsoleEvent } from '../actions/console';
import { stopSketch, expandConsole } from '../actions/ide';

export default function useHandleMessageEvent() {
  const dispatch = useDispatch();

  const handleMessageEvent = (data) => {
    const { source, messages } = data;
    if (source === 'sketch' && Array.isArray(messages)) {
      const decodedMessages = messages.map((message) => Decode(message.log));
      decodedMessages.every((message, index, arr) => {
        const { data: args } = message;
        let hasInfiniteLoop = false;
        Object.keys(args).forEach((key) => {
          if (
            typeof args[key] === 'string' &&
            args[key].includes('Exiting potential infinite loop')
          ) {
            dispatch(stopSketch());
            dispatch(expandConsole());
            hasInfiniteLoop = true;
          }
        });
        if (hasInfiniteLoop) {
          return false;
        }
        return true;
      });
      dispatch(dispatchConsoleEvent(decodedMessages));
    }
  };
  return handleMessageEvent;
}
