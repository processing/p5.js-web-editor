function renderPreviewIndex() {
  const assetsManifest =
    process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          if (!window.process) {
            window.process = {};
          }
          if (!window.process.env) {
            window.process.env = {};
          }
          window.process.env.PREVIEW_SCRIPTS_URL = '${
            process.env.NODE_ENV === 'production'
              ? `${assetsManifest['/previewScripts.js']}`
              : '/previewScripts.js'
          }';
          window.process.env.EDITOR_URL = '${process.env.EDITOR_URL}';
        </script>
        </head>
      <body>
        <div id="root" class="root-app">
          <script src="/preview-app.js"></script>
        </div>
      </body>
    </html>
  `;
}

export default renderPreviewIndex;
