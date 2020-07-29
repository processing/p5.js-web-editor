import React, { useEffect, useRef, useMemo, useState } from 'react';

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

// TODO: This is HOC, not a hook. Where do we put it?
export const useAsModal = (component) => {
  const [visible, trigger, setRef] = useModalBehavior();

  const wrapper = () => (<div ref={setRef}> {visible && component} </div>); // eslint-disable-line

  return [trigger, wrapper];
};
