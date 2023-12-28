import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import EmbedFrame from '../../Preview/EmbedFrame';

function ExamplePreview({ sketch }) {
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
  }).isRequired
};

export default ExamplePreview;
