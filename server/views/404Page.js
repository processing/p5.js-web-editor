import testSketch from './notFoundSketches/testSketch';
import testSketch2 from './notFoundSketches/testSketch2';
const sketches = [testSketch, testSketch2];

export function render404Page() {
  const randomNum = Math.floor(Math.random() * sketches.length);
  const notFoundSketch = sketches[randomNum];

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>p5.js Web Editor</title>
      <link rel='shortcut icon' href='https://raw.githubusercontent.com/processing/p5.js-website-OLD/master/favicon.ico' type='image/x-icon'/ >
      <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.4/p5.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.4/addons/p5.dom.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.4/addons/p5.sound.min.js"></script>
      <style>
        html, body {
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <script>${notFoundSketch()}</script>
    </body>
  </html>
  `;
}
