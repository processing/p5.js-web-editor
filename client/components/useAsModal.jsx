import React from 'react';
import styled from 'styled-components';
import { useModalBehavior } from '../utils/custom-hooks';

const BackgroundOverlay = styled.div`
  position: absolute;
  z-index: 2;
  width: 100% !important;
  height: 100% !important;
  
  background: black;
  opacity: 0.3;
`;

export default (component, hasOverlay = false) => {
  const [visible, toggle, setRef] = useModalBehavior();

  const wrapper = () => (<div>
    {hasOverlay && visible && <BackgroundOverlay />}
    <div ref={setRef}> {visible && component} </div>
  </div>); // eslint-disable-line

  return [toggle, wrapper];
};
