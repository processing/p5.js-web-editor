import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import PlayIcon from '../../../images/triangle-arrow-right.svg';
import StopIcon from '../../../images/stop.svg';
import { prop, remSize } from '../../../theme';
import { startSketch, stopSketch } from '../actions/ide';
import { RootState } from '../../../reducers';

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

interface FloatingActionButtonProps {
  syncFileContent: () => void;
  offsetBottom: number;
}

export const FloatingActionButton = ({
  syncFileContent,
  offsetBottom
}: FloatingActionButtonProps) => {
  const isPlaying = useSelector((state: RootState) => state.ide.isPlaying);
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
        } else {
          dispatch(stopSketch());
        }
      }}
    >
      {isPlaying ? (
        <StopIcon focusable="false" aria-hidden="true" />
      ) : (
        <PlayIcon focusable="false" aria-hidden="true" />
      )}
    </Button>
  );
};
