/* https://usehooks.com/usePrevious/ */
import React, { useRef, useEffect } from 'react';

export default function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
