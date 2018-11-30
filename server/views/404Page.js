import User from '../models/user';
import Project from '../models/project';

export function get404Sketch(callback) {
  User.findOne({ username: 'p5' }, (userErr, user) => { // Find p5 user
    if (userErr) {
      throw userErr;
    } else {
      Project.find({ user: user._id }, (projErr, projects) => { // Find example projects
        // Choose a random sketch
        const randomIndex = Math.floor(Math.random() * projects.length);
        const sketch = projects[randomIndex];
        let instanceMode = false;

        // Get sketch files
        let htmlFile = sketch.files.filter(file => file.name.match(/.*\.html$/i))[0].content;
        const jsFiles = sketch.files.filter(file => file.name.match(/.*\.js$/i));
        const cssFiles = sketch.files.filter(file => file.name.match(/.*\.css$/i));
        const linkedFiles = sketch.files.filter(file => file.url);

        instanceMode = jsFiles.find(file => file.name === 'sketch.js').content.includes('Instance Mode');

        jsFiles.forEach((file) => { // Add js files as script tags
          const html = htmlFile.split('</body>');
          html[0] = `${html[0]}<script>${file.content}</script>`;
          htmlFile = html.join('</body>');
        });

        cssFiles.forEach((file) => { // Add css files as style tags
          const html = htmlFile.split('</head>');
          html[0] = `${html[0]}<style>${file.content}</style>`;
          htmlFile = html.join('</head>');
        });

        linkedFiles.forEach((file) => { // Add linked files as link tags
          const html = htmlFile.split('<head>');
          html[1] = `<link href=${file.url}>${html[1]}`;
          htmlFile = html.join('<head>');
        });

        // Add 404 html and position canvas
        const html = htmlFile.split('</head>');
        const metaDescription = 'A web editor for p5.js, a JavaScript library with the goal of making coding accessible to artists, designers, educators, and beginners.'; // eslint-disable-line
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
        html[1] = `
          <div class="header">
            <div class="message-container">
              <h1>404 Page Not Found</h1>
              <h6 class="message">The page you are trying to reach does not exist.</h6>
              <h6 class="message">
                Please check the URL or return to the <a href="/" class="home-link">home page</a>.
              </h6>
            </div>
          </div>
          ${html[1]}
        `;
        htmlFile = html.join('</head>');

        // Fix links to assets
        htmlFile = htmlFile.replace(
          /'assets/g,
          "'https://rawgit.com/processing/p5.js-website/master/dist/assets/examples/assets/"
        );
        htmlFile = htmlFile.replace(
          /"assets/g,
          '"https://rawgit.com/processing/p5.js-website/master/dist/assets/examples/assets/'
        );

        // Change canvas size
        htmlFile = htmlFile.replace(/createCanvas\(\d+, ?\d+/g, instanceMode ?
          'createCanvas(p.windowWidth, p.windowHeight'
          :
          'createCanvas(windowWidth, windowHeight');

        callback(htmlFile);
      });
    }
  });
}

export default get404Sketch;

