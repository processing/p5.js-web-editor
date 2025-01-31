import React, { useEffect, useState } from 'react';
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

const CoordinateTracker = (isPlaying) => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log('we here');
    let isListenerAttached = false;
    let mouseMoveHandler;
    let canvas;

    const waitForCanvas = () => {
      const iFrame = document.getElementById('previewIframe0');
      canvas = iFrame.contentWindow.document.getElementById('defaultCanvas0');
      console.log('iframe: ', iFrame);

      if (canvas && !isListenerAttached) {
        isListenerAttached = true;
        console.log('Adding listener');

        mouseMoveHandler = (event) => {
          console.log('hellooooo');
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          setCoordinates({ x, y });
        };

        console.log('mouseMoveHandler', mouseMoveHandler);
        console.log('canvas', canvas);

        document
          .querySelector('#defaultCanvas0')
          .addEventListener('mousemove', () => {
            console.log('Button clicked!');
            mouseMoveHandler();
          });
        // canvas.addEventListener('mousemove', mouseMoveHandler);
      } else if (!canvas) {
        setTimeout(waitForCanvas, 500);
      }
    };

    waitForCanvas();

    return () => {
      if (canvas && isListenerAttached) {
        console.log('Removing listener');
        canvas.removeEventListener('mousemove', mouseMoveHandler);
        canvas = null;
        isListenerAttached = false;
      }
    };
  }, [isPlaying]);

  return (
    <CoordContainer>
      <p>
        Mouse X: {isPlaying ? coordinates.x : 0} Mouse Y:{' '}
        {isPlaying ? coordinates.y : 0}
      </p>
    </CoordContainer>
  );
};

export default CoordinateTracker;
