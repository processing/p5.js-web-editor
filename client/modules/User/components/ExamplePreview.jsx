import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import EmbedFrame from '../../Preview/EmbedFrame';

function ExamplePreview({ sketch, setSketch }) {
  const [hover, setHover] = useState(false);
  const sketchHeight = useMemo(() => {
    const jsFile = (sketch?.files || []).find(
      (file) => file.name === 'sketch.js'
    );
    return jsFile?.content?.match(/createCanvas\(\d+, ?(\d+)/)[1];
  }, [sketch]);

  const { files = [] } = sketch;

  return (
    <React.Fragment>
      {files.length > 0 ? (
        <>
          <button
            onClick={() => setSketch()}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            style={{
              width: '100%',
              height: `50px`,
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              backgroundColor: hover ? '#ed225d' : 'transparent',
              fontWeight: 'bold',
              fontSize: '2rem',
              color: 'black'
            }}
          >
            X
          </button>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: `${sketchHeight || 400}px`
            }}
          >
            <EmbedFrame
              files={files}
              basePath={window.location.pathname}
              textOutput={false}
              gridOutput={false}
              isPlaying
            />
          </div>
        </>
      ) : (
        <div>loading</div>
      )}
    </React.Fragment>
  );
}

ExamplePreview.propTypes = {
  sketch: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        content: PropTypes.string
      })
    )
  }).isRequired,
  setSketch: PropTypes.func.isRequired
};

export default ExamplePreview;
