import React from 'react';
import styled, { keyframes } from 'styled-components';
import { prop, remSize } from '../../../theme';

const skBounce = keyframes`
  0%, 100% {
    transform: scale(0.0);
  }
  50% {
    transform: scale(1.0);
  }
`;
const Container = styled.div`
  &&& {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${prop('backgroundColor')};
  }
`;
const LoaderWrapper = styled.div`
  &&& {
    width: ${remSize(80)};
    height: ${remSize(80)};
    position: relative;
  }
`;
const LoaderCircle = styled.div`
  &&& {
    width: 100%;
    height: 100%;
    border-radius: 80%;
    background-color: ${prop('logoColor')};
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;
    animation: ${skBounce} 2s infinite ease-in-out;
    &:nth-child(2) {
      animation-delay: -1s;
    }
  }
`;

const Loader = () => (
  <Container>
    <LoaderWrapper>
      <LoaderCircle />
      <LoaderCircle />
    </LoaderWrapper>
  </Container>
);
export default Loader;
