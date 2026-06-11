import axios from 'axios';

const insertErrorMessage = (htmlFile) => {
  const html = htmlFile.split('</head>');
  const metaDescription =
    'A web editor for p5.js, a JavaScript library with the goal of making coding accessible to artists, designers, educators, and beginners.'; // eslint-disable-line
  html[0] = `
    ${html[0]}
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="p5.js, p5.js web editor, web editor, processing, code editor" />
    <meta name="description" content="${metaDescription}" />
    <title>404 Page Not Found - p5.js Web Editor</title>
    <style>
      .header {
        position: fixed;
        height: 200px;
        width: 100%;
        z-index: 1;
        background: white;
        color: #ed225d;
        font-family: Montserrat, sans-serif;
        text-align: center;
        display: table;
      }
      .message-container {
        display: table-cell;
        vertical-align: middle;
      }
      .message {
        color: #6b6b6b;
        margin: 10px;
      }
      .home-link {
        color: #b5b5b5;
        text-decoration: none;
      }
      canvas {
        position: fixed;
        width: 100% !important;
        height: 100% !important;
      }
    </style>
    <link href='https://fonts.googleapis.com/css?family=Inconsolata' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
    <link
      rel='shortcut icon'
      href='https://raw.githubusercontent.com/processing/p5.js-website-OLD/master/favicon.ico'
      type='image/x-icon'
    >
  `;
  const body = html[1].split('<body>');
  html[1] = `
    ${body[0]}
    <body>
      <div class="header">
        <div class="message-container">
          <h1>404 Page Not Found</h1>
          <h6 class="message">The page you are trying to reach does not exist.</h6>
          <h6 class="message">
            Please check the URL or return to the <a href="/" class="home-link">home page</a>.
          </h6>
        </div>
      </div>
    ${body[1]}
  `;
  return html.join('</head>');
};

// Bare 404 page with no sketch background. Used as the response when no
// featured sketch is configured or when fetching it from OpenProcessing fails.
const staticErrorPage = () =>
  insertErrorMessage(`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
      </body>
    </html>`);

// CDN p5 build used to run the featured 404 sketch in the browser. The editor
// server no longer stores sketches, so the background animation is rendered by
// loading a published OpenProcessing sketch's code directly.
const P5_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js';

/**
 * Render the 404 page with a featured p5 sketch animating in the background.
 *
 * The sketch is pulled from OpenProcessing (set OP_404_SKETCH_ID to a public
 * sketch's visualID). If that env var is unset, or OP can't be reached, we
 * fall back to the plain styled 404 page — the editor server keeps no local
 * copy of any sketch.
 */
export const get404Sketch = async () => {
  const sketchId = process.env.OP_404_SKETCH_ID;
  if (!sketchId || !process.env.API_URL) {
    return staticErrorPage();
  }

  try {
    const headers = process.env.API_TOKEN
      ? { Authorization: `Bearer ${process.env.API_TOKEN}` }
      : undefined;

    // OP returns an array of code tabs: { title, code, ... }
    const { data: codeTabs } = await axios.get(
      `${process.env.API_URL}/sketch/${sketchId}/code`,
      {
        headers,
        timeout: 5000
      }
    );

    if (!Array.isArray(codeTabs) || codeTabs.length === 0) {
      return staticErrorPage();
    }

    const jsTabs = codeTabs.filter((tab) => /\.js$/i.test(tab.title || ''));
    if (jsTabs.length === 0) {
      return staticErrorPage();
    }

    // Make the sketch fill the window regardless of its declared canvas size.
    const inlineScripts = jsTabs
      .map((tab) => {
        const code = (tab.code || '').replace(
          /createCanvas\(\s*[^)]*?\)/g,
          'createCanvas(windowWidth, windowHeight)'
        );
        return `<script>${code}</script>`;
      })
      .join('\n');

    const htmlFile = insertErrorMessage(`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <script src="${P5_CDN}"></script>
        </head>
        <body>
          ${inlineScripts}
        </body>
      </html>`);

    return htmlFile;
  } catch (err) {
    console.error(
      'Error retrieving 404 sketch from OpenProcessing:',
      err.message
    );
    return staticErrorPage();
  }
};

export default get404Sketch;
