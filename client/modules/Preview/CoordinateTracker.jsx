import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize } from '../../theme';

const CoordContainer = styled.div`
  z-index: 1000;
  padding: ${remSize(0.1)};
  // border-bottom: ${remSize(1)} dashed #a6a6a6;
  margin-bottom: ${remSize(4)};

  p {
    font-size: ${remSize(9.5)};
    padding: 0 0 ${remSize(3.5)} ${remSize(3.5)};
    margin: 0;
    font-family: Inconsolata, monospace;
    font-weight: light;
    color: ${(props) => props.theme.Button.primary.default.foreground};
  }

  @media (max-width: 550px) {
    // border-bottom: none;
    margin-top: ${remSize(10)};
  }
`;

const CoordinateTracker = ({ isPlaying, sketchReloaded }) => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let canvas;
    let mouseMoveHandler;

    const timeout = setTimeout(() => {
      const iFrame = document.getElementById('previewIframe0');
      canvas = iFrame?.contentWindow?.document?.getElementById(
        'defaultCanvas0'
      );

      if (!canvas) {
        console.warn('Canvas not found.');
        return;
      }

      mouseMoveHandler = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setCoordinates({ x, y });
      };

      canvas.addEventListener('mousemove', mouseMoveHandler);
    }, 500);

    return () => {
      clearTimeout(timeout);

      if (canvas && mouseMoveHandler) {
        canvas.removeEventListener('mousemove', mouseMoveHandler);
      }
    };
  }, [isPlaying, sketchReloaded]);

  return (
    <CoordContainer>
      <p>
        Mouse X: {isPlaying ? coordinates.x : 0} Mouse Y:{' '}
        {isPlaying ? coordinates.y : 0}
      </p>
    </CoordContainer>
  );
};

CoordinateTracker.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  sketchReloaded: PropTypes.bool.isRequired
};

export default CoordinateTracker;
