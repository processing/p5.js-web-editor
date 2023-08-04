import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import PlayIcon from '../../../images/triangle-arrow-right.svg';
import StopIcon from '../../../images/stop.svg';
import { prop, remSize } from '../../../theme';
import { startSketch, stopSketch } from '../actions/ide';

const Button = styled.div`
  position: fixed;
  right: ${remSize(20)};
  bottom: ${remSize(20)};
  height: ${remSize(60)};
  width: ${remSize(60)};
  z-index: 3;
  cursor: pointer;
  ${prop('Button.secondary.default')};
  aspect-ratio: 1/1;
  border-radius: 99999px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  /* scale: 0.75; */
  /* padding-left: 1.8rem; */
  &[data-behaviour='stop'] {
    ${prop('Button.primary.default')}
    g {
      fill: ${prop('Button.primary.default.foreground')};
    }
  }
  > svg {
    width: 35%;
    height: 35%;
    > g {
      fill: white;
    }
  }
`;

const FloatingActionButton = (props) => {
  const isPlaying = useSelector((state) => state.ide.isPlaying);
  const dispatch = useDispatch();

  return (
    <Button
      data-behaviour={isPlaying ? 'stop' : 'run'}
      style={{ paddingLeft: isPlaying ? 0 : remSize(5) }}
      onClick={() => {
        if (!isPlaying) {
          props.syncFileContent();
          dispatch(startSketch());
        }
        if (isPlaying) dispatch(stopSketch());
      }}
    >
      {isPlaying ? <StopIcon /> : <PlayIcon />}
    </Button>
  );
};

FloatingActionButton.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default FloatingActionButton;
