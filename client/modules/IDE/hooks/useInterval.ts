// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
import { useState, useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>();
  const [intervalId, setIntervalId] = useState<
    ReturnType<typeof setInterval>
  >();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [delay]);
  return () => clearInterval(intervalId);
}
