import React, { useEffect, useMemo, useState } from 'react';
import { PropTypes } from 'prop-types';
import axios from 'axios';
import { createGlobalStyle } from 'styled-components';
import getConfig from '../../../utils/getConfig';
import EmbedFrame from '../../Preview/EmbedFrame';
import { registerFrame } from '../../../utils/dispatcher';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

function ExamplePreview({ url }) {
  const [sketch, setSketch] = useState(null);
  registerFrame(window.parent, getConfig('EDITOR_URL'));

  useEffect(() => {
    async function getRandomProject() {
      // Find example projects
      const response = await axios.get(url);
      const projects = response.data;
      if (!projects) return null;
      setSketch(projects);
      console.log('sketch', sketch);
      return projects;
    }
    getRandomProject();
  }, [url]);

  const files = useMemo(() => {
    const instanceMode = (sketch?.files || [])
      .find((file) => file.name === 'sketch.js')
      ?.content?.includes('Instance Mode');

    return (sketch?.files || []).map((file) => ({
      ...file,
      content: file.content
        // Fix links to assets
        .replace(
          /'assets/g,
          "'https://github.com/processing/p5.js-website/raw/main/src/data/examples/assets"
        )
        .replace(
          /"assets/g,
          '"https://github.com/processing/p5.js-website/raw/main/src/data/examples/assets'
        )
        // Change canvas size
        .replace(
          /createCanvas\(\d+, ?\d+/g,
          instanceMode
            ? 'createCanvas(p.windowWidth, p.windowHeight'
            : 'createCanvas(windowWidth, windowHeight'
        )
    }));
  }, [sketch]);
  console.log(files, 'files');
  return (
    <React.Fragment>
      {files.length > 0 ? (
        <div style={{ position: 'relative', width: '100%', height: '10rem' }}>
          <GlobalStyle />
          <EmbedFrame
            files={files}
            basePath={`${window.location.pathname}/3D:_basic_shader`}
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
  url: PropTypes.string.isRequired
};

export default ExamplePreview;
