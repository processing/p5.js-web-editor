export function renderIndex() {
  const assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  const chunkManifest = process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>p5.js Web Editor</title>
      ${process.env.NODE_ENV === 'production' ? `<link rel='stylesheet' href='/dist/${assetsManifest['/app.css']}' />` : ''}
      <link href='https://fonts.googleapis.com/css?family=Inconsolata' rel='stylesheet' type='text/css'>
      <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
    </head>
    <body>
      <div id="root" class="root-app">
      </div>
      <script>
          ${process.env.NODE_ENV === 'production' ?
          `//<![CDATA[
          window.webpackManifest = ${JSON.stringify(chunkManifest)};
          //]]>` : ''}
        </script>
        <script src='${process.env.NODE_ENV === 'production' ? `/dist/${assetsManifest['/vendor.js']}` : '/dist/vendor.js'}'></script>
        <script src='${process.env.NODE_ENV === 'production' ? `/dist/${assetsManifest['/app.js']}` : '/dist/app.js'}'></script>
    </body>
  </html>
  `;
}