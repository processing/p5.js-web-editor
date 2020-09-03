import React, { useEffect, useCallback, useRef, useState } from 'react';

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
  const [visible, setVisible] = useState(false);
  const trigger = () => setVisible(!visible);

  const hide = () => setVisible(false);


  const handleClickOutside = ({ target }) => {
    if (ref && ref.current && !(ref.current.contains && ref.current.contains(target))) {
      hide();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  return [visible, trigger, setRef];
};

// Usage: useEffectWithComparison((props, prevProps) => { ... }, { prop1, prop2 })
// This hook basically applies useEffect but keeping track of the last value of relevant props
// So you can passa a 2-param function to capture new and old values and do whatever with them.
export const useEffectWithComparison = (fn, props) => {
  const [prevProps, update] = useState({});

  return useEffect(() => {
    fn(props, prevProps);
    update(props);
  }, Object.values(props));
};

// Creates a global event listener for the event
export const useEventListener = (event, callback, useCapture = false, list = []) => useEffect(() => {
  document.addEventListener(event, callback, useCapture);
  return () => document.removeEventListener(event, callback, useCapture);
}, list);

const isTouchEvent = event => 'touches' in event;

const preventDefault = (event) => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};

// Use Long Press: Creates a set of events based on a longPress and an onClick event creators.
export const useLongPress = (onLongPress, onClick, { shouldPreventDefault = true, delay = 300 } = {}) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef();
  const target = useRef();

  const start = useCallback(
    (event) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, {
          passive: false
        });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      if (timeout.current) clearTimeout(timeout.current);
      if (shouldTriggerClick && !longPressTriggered) onClick();
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: e => start(e),
    onTouchStart: e => start(e),
    onMouseUp: e => clear(e),
    onMouseLeave: e => clear(e, false),
    onTouchEnd: e => clear(e)
  };
};
