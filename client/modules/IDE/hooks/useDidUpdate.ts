import React, { useEffect, useRef } from 'react';

export const useDidUpdate = (
  callback: () => void,
  deps: React.DependencyList = []
) => {
  const hasMount = useRef(false);

  useEffect(() => {
    if (hasMount.current) {
      callback();
    } else {
      hasMount.current = true;
    }
  }, deps);
};
