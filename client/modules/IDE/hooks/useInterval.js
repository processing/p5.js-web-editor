// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
import { useState, useEffect, useRef } from 'react';

export default function useInterval(callback, delay) {
  const savedCallback = useRef();
  const [intervalId, setIntervalId] = useState();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      setIntervalId(id);
      return () => clearInterval(id);
    }
    return null;
  }, [delay]);
  return () => clearInterval(intervalId);
}
