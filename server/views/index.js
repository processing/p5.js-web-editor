export function renderIndex() {
  const assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  const chunkManifest = process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="keywords" content="p5.js, p5.js web editor, web editor, processing, code editor" />
      <meta name="description" content="A web editor for p5.js, a JavaScript library with the goal of making coding accessible to artists, designers, educators, and beginners." />
      <title>p5.js Web Editor</title>
      ${process.env.NODE_ENV === 'production' ? `<link rel='stylesheet' href='/dist${assetsManifest['/app.css']}' />` : ''}
      <link href='https://fonts.googleapis.com/css?family=Inconsolata' rel='stylesheet' type='text/css'>
      <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
      <link rel='shortcut icon' href='https://raw.githubusercontent.com/processing/p5.js-website-OLD/master/favicon.ico' type='image/x-icon'/ >
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
        <script src='${process.env.NODE_ENV === 'production' ? `/dist${assetsManifest['/vendor.js']}` : '/dist/vendor.js'}'></script>
        <script src='${process.env.NODE_ENV === 'production' ? `/dist${assetsManifest['/app.js']}` : '/dist/app.js'}'></script>
        <script>
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

          ga('create', 'UA-53383000-1', 'auto');
          ga('send', 'pageview');

        </script>
    </body>
  </html>
  `;
}
