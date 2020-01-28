export function renderIndex() {
  const assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="keywords" content="p5.js, p5.js web editor, web editor, processing, code editor" />
      <meta name="description" content="A web editor for p5.js, a JavaScript library with the goal of making coding accessible to artists, designers, educators, and beginners." />
      <title>p5.js Web Editor</title>
      ${process.env.NODE_ENV === 'production' ? `<link rel='stylesheet' href='${assetsManifest['/app.css']}' />` : ''}
      <link href='https://fonts.googleapis.com/css?family=Inconsolata' rel='stylesheet' type='text/css'>
      <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
      <link rel='shortcut icon' href='https://raw.githubusercontent.com/processing/p5.js-website-OLD/master/favicon.ico' type='image/x-icon' / >
      <script>
        if (!window.process) {
          window.process = {};
        }
        if (!window.process.env) {
          window.process.env = {};
        }
        window.process.env.API_URL = '${process.env.API_URL}';
        window.process.env.NODE_ENV = '${process.env.NODE_ENV}';
        window.process.env.S3_BUCKET = '${process.env.S3_BUCKET}';
        window.process.env.S3_BUCKET_URL_BASE = ${process.env.S3_BUCKET_URL_BASE ? `'${process.env.S3_BUCKET_URL_BASE}'` : undefined};
        window.process.env.AWS_REGION = '${process.env.AWS_REGION}';
        window.process.env.FORCE_TO_HTTPS = ${process.env.FORCE_TO_HTTPS === 'false' ? false : undefined};
        window.process.env.CLIENT = true;
        window.process.env.LOGIN_ENABLED = ${process.env.LOGIN_ENABLED === 'false' ? false : true};
        window.process.env.EXAMPLES_ENABLED = ${process.env.EXAMPLES_ENABLED === 'false' ? false : true};
      </script>
    </head>
    <body>
      <div id="root" class="root-app">
      </div>
      <script src='${process.env.NODE_ENV === 'production' ? `${assetsManifest['/app.js']}` : '/app.js'}'></script>
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
