import React from 'react';
import { useModalBehavior } from '../utils/custom-hooks';

export default (component) => {
  const [visible, trigger, setRef] = useModalBehavior();

  const wrapper = () => <div ref={setRef}> {visible && component} </div>; // eslint-disable-line

  return [trigger, wrapper];
};
