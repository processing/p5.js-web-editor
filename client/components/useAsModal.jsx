import React from 'react';
import styled from 'styled-components';
import { useModalBehavior } from '../utils/custom-hooks';

const BackgroundOverlay = styled.div`
  position: fixed;
  z-index: 2;
  width: 100% !important;
  height: 100% !important;

  background: black;
  opacity: 0.3;
`;

export default (Element, hasOverlay = false) => {
  const [visible, toggle, setRef] = useModalBehavior();

  const wrapper = () =>
    visible && (
      <div>
        {hasOverlay && <BackgroundOverlay />}
        <div ref={setRef}>
          {typeof Element === 'function' ? Element(toggle) : Element}
        </div>
      </div>
    );

  return [toggle, wrapper];
};
