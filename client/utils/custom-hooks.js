import React, { useEffect, useRef, useState } from 'react';

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

// Usage: const ref = useModalBehavior(() => setSomeState(false))
// place this ref on a component
export const useModalBehavior = (hideOverlay) => {
  const ref = useRef({});

  // Return values
  const setRef = (r) => { ref.current = r; };
  const [visible, setVisible] = useState(true);
  const trigger = () => setVisible(true);

  const hide = () => setVisible(false);


  const handleClickOutside = ({ target }) => {
    if (ref && ref.current && !ref.current.contains(target)) {
      hide();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  return [visible, trigger, setRef];
};
