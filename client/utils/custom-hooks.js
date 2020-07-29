import React, { useEffect, useRef } from 'react';

export const noop = () => {};

export const useDidUpdate = (callback, deps) => {
  const hasMount = useRef(false);

  useEffect(() => {
    if (hasMount.current) {
      callback();
    } else {
      hasMount.current = true;
    }
  }, deps);
};

export const useHideOnBlur = (hideOverlay) => {
  const ref = useRef({});
  const setRef = (r) => { ref.current = r; };

  const handleClickOutside = ({ target }) => {
    if (ref && ref.current && !ref.current.contains(target)) {
      hideOverlay();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  return setRef;
};
