import { mapKeys } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Attaches keydown handlers to the global document.
 *
 * Handles Mac/PC switching of Ctrl to Cmd.
 *
 * @param {Record<string, (e: KeyboardEvent) => void>} keyHandlers - an object
 * which maps from the key to its event handler.  The object keys are a combination
 * of the key and prefixes `ctrl-` `shift-` (ie. 'ctrl-f', 'ctrl-shift-f')
 * and the values are the function to call when that specific key is pressed.
 */
export default function useKeyDownHandlers(keyHandlers) {
  /**
   * Instead of memoizing the handlers, use a ref and call the current
   * handler at the time of the event.
   */
  const handlers = useRef(keyHandlers);

  useEffect(() => {
    handlers.current = mapKeys(keyHandlers, (value, key) => key?.toLowerCase());
  }, [keyHandlers]);

  /**
   * Will call all matching handlers, starting with the most specific: 'ctrl-shift-f' => 'ctrl-f' => 'f'.
   * Can use e.stopPropagation() to prevent subsequent handlers.
   * @type {(function(KeyboardEvent): void)}
   */
  const handleEvent = useCallback((e) => {
    if (!e.key) return;
    const isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    const isCtrl = isMac ? e.metaKey : e.ctrlKey;
    if (e.shiftKey && isCtrl) {
      handlers.current[
        `ctrl-shift-${
          /^\d+$/.test(e.code.at(-1)) ? e.code.at(-1) : e.key.toLowerCase()
        }`
      ]?.(e);
    } else if (isCtrl && e.altKey && e.code === 'KeyN') {
      // specifically for creating a new file
      handlers.current[`ctrl-alt-n`]?.(e);
    } else if (isCtrl) {
      handlers.current[`ctrl-${e.key.toLowerCase()}`]?.(e);
    }
    handlers.current[e.key?.toLowerCase()]?.(e);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEvent);

    return () => document.removeEventListener('keydown', handleEvent);
  }, [handleEvent]);
}

/**
 * Component version can be used in class components where hooks can't be used.
 *
 * @param {Record<string, (e: KeyboardEvent) => void>} handlers
 */
export const DocumentKeyDown = ({ handlers }) => {
  useKeyDownHandlers(handlers);
  return null;
};
DocumentKeyDown.propTypes = {
  handlers: PropTypes.objectOf(PropTypes.func)
};
