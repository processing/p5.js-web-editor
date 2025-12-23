import { currentP5Version } from '../../common/p5Versions';
import {
  p5SoundURLOldTemplate,
  p5SoundURL,
  p5PreloadAddonURL,
  p5ShapesAddonURL,
  p5DataAddonURL,
  p5URLTemplate
} from '../../common/p5URLs';

export const defaultSketch = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}`;

const majorVersion = (version) => version.split('.')[0];

export function defaultHTML({
  version = currentP5Version,
  sound = true,
  preload = false,
  shapes = false,
  data = false
} = {}) {
  const p5URL = p5URLTemplate.replace('$VERSION', version);

  const soundURL =
    majorVersion(version) === '2'
      ? p5SoundURL
      : p5SoundURLOldTemplate.replace('$VERSION', version);

  const libraries = [
    `<script src="${p5URL}"></script>`,
    sound ? `<script src="${soundURL}"></script>` : '',
    preload ? `<script src="${p5PreloadAddonURL}"></script>` : '',
    shapes ? `<script src="${p5ShapesAddonURL}"></script>` : '',
    data ? `<script src="${p5DataAddonURL}"></script>` : ''
  ].join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    ${libraries}
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />

  </head>
  <body>
    <main>
    </main>
    <script src="sketch.js"></script>
  </body>
</html>
`;
}

export const defaultCSS = `html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
`;

export default function createDefaultFiles() {
  return {
    'index.html': {
      content: defaultHTML()
    },
    'style.css': {
      content: defaultCSS
    },
    'sketch.js': {
      content: defaultSketch
    }
  };
}
