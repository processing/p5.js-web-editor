import { useEffect, useRef } from 'react';

/**
 * Lets you do something similar to previousProps in class-based React.
 * https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
 */
export default function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    // TODO: mb should just be {...}?
    ref.current = JSON.parse(JSON.stringify(value));
  }, [value]);
  return ref.current;
}
