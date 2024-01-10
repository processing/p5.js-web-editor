import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import PlayIcon from '../../../images/triangle-arrow-right.svg';
import StopIcon from '../../../images/stop.svg';
import { prop, remSize } from '../../../theme';
import { startSketch, stopSketch } from '../actions/ide';

const Button = styled.button`
  position: fixed;
  right: ${remSize(20)};
  bottom: ${remSize(20)};
  height: ${remSize(60)};
  width: ${remSize(60)};
  z-index: 3;
  padding: 0;
  ${prop('Button.secondary.default')};
  aspect-ratio: 1/1;
  border-radius: 99999px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  &.stop {
    ${prop('Button.primary.default')}
    g {
      fill: ${prop('Button.primary.default.foreground')};
    }
  }
  > svg {
    width: 35%;
    height: 35%;
    > g {
      fill: ${prop('Button.primary.hover.foreground')};
    }
  }
`;

const FloatingActionButton = ({ syncFileContent, offsetBottom }) => {
  const isPlaying = useSelector((state) => state.ide.isPlaying);
  const dispatch = useDispatch();

  return (
    <Button
      className={classNames({ stop: isPlaying })}
      style={{
        paddingLeft: isPlaying ? 0 : remSize(5),
        marginBottom: offsetBottom
      }}
      onClick={() => {
        if (!isPlaying) {
          syncFileContent();
          dispatch(startSketch());
        } else dispatch(stopSketch());
      }}
    >
      {isPlaying ? <StopIcon /> : <PlayIcon />}
    </Button>
  );
};

FloatingActionButton.propTypes = {
  syncFileContent: PropTypes.func.isRequired,
  offsetBottom: PropTypes.number.isRequired
};

export default FloatingActionButton;
