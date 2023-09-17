import { useEffect, useRef } from 'react';
import useKeyDownHandlers from './useKeyDownHandlers';

/**
 * Common logic for Modal, Overlay, etc.
 *
 * Pass in the `onClose` handler.
 *
 * Can optionally pass in a ref, in case the `onClose` function needs to use the ref.
 *
 * Calls the provided `onClose` function on:
 *  - Press Escape key.
 *  - Click outside the element.
 *
 * Returns a ref to attach to the outermost element of the modal.
 *
 * @param {() => void} onClose
 * @param {React.MutableRefObject<HTMLElement | null>} [passedRef]
 * @return {React.MutableRefObject<HTMLElement | null>}
 */
export default function useModalClose(onClose, passedRef) {
  const createdRef = useRef(null);
  const modalRef = passedRef || createdRef;

  useEffect(() => {
    modalRef.current?.focus();

    function handleClick(e) {
      // ignore clicks on the component itself
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.();
      }
    }

    document.addEventListener('click', handleClick, false);

    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  }, [onClose, modalRef]);

  useKeyDownHandlers({ escape: onClose });

  return modalRef;
}
