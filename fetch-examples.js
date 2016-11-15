"use strict"
const request = require('request');
const mongoose = require('mongoose');
const objectID = require('bson-objectid');
const shortid = require('shortid');

mongoose.connect('mongodb://localhost:27017/p5js-web-editor');
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

// import User from './server/models/user';
const User = require('./server/models/user');
const Project = require('./server/models/project');

const defaultSketch = `function setup() { 
  createCanvas(400, 400);
} 

function draw() { 
  background(220);
}`;

const defaultHTML =
`<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.4/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.4/addons/p5.dom.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.4/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
`;

const defaultCSS =
`html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
`;

let sketchContent = '';
let projectName = '';

const a = objectID().toHexString();
const b = objectID().toHexString();
const c = objectID().toHexString();
const r = objectID().toHexString();

const headers = {'User-Agent': 'p5.js-editor/0.0.1'};
// get example source files
const options = {
    url: 'https://api.github.com/repos/processing/p5.js-website/contents/dist/assets/examples/en',
    method: 'GET',
    headers: headers,
    auth: {
      'user': 'yining1023',
      'pass': '581321Gre',
      'sendImmediately': false
    }
};
let requestParams = [];

// request skecthes from p5 website github
request(options, (error, response, body) => {
  const json = JSON.parse(body);
  json.forEach(metadata => {
    // extract category for filename
    const category = metadata.name.split("_")[1];
    requestParams.push({url: metadata.url, category: category});
  });
  saveDataForCategory(requestParams);
});
// get example assets
// options.url = 'https://api.github.com/repos/processing/p5.js-website/contents/dist/assets/examples/assets';
// request(options, function (error, response, body) {
//   var assetsDest = "./public/mode_assets/p5/example_assets/";
//   if (!error && response.statusCode == 200) {
//     var json = JSON.parse(body);
//     json.forEach(function(data) {
//       var fileName = data.name;
//       download(data.download_url)
//         .pipe(gulp.dest(assetsDest));
//     });
//   }
// });

function saveDataForCategory(requestParams) {
  const headers = {'User-Agent': 'p5.js-editor/0.0.1'};
  requestParams.forEach(function(params)  {
    // extract download URL for examples in this category
    const options = {
      url: params.url,
      method: 'GET',
      headers: headers,
      auth: {
        'user': 'yining1023',
        'pass': '581321Gre',
        'sendImmediately': false
      }
    };
    let fileMetadata = [];
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const json = JSON.parse(body);
        console.log(json[0].download_url);
        projectName = json[0].name;
        getSketchContent(json[0].download_url);
        // json.forEach(function(data) {
        //   var fileName = data.name;
        //   var destination = "./public/mode_assets/p5/examples/".concat(params.category);
        //   download(data.download_url)
        //     .pipe(gulp.dest(destination));
        // });
      }
    });
  });
}

// get sketch content
function getSketchContent(sketchUrl) {
  const headers = {'User-Agent': 'p5.js-editor/0.0.1'};
  const options = {
    url: sketchUrl,
    method: 'GET',
    headers: headers,
    auth: {
      'user': 'yining1023',
      'pass': '581321Gre',
      'sendImmediately': false
    }
  };

  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      // console.log(body);
      sketchContent = body;
      createProjectInP5user();
    }
  });
}

function createProjectInP5user() {
  // get p5 user, if no, create one
  User.findOne({username: 'p5'}, (err, user) => {
    if (err) throw err;

    if (!user) {
      user = new User({
        username: 'p5',
        email: 'p5-examples@gmail.com',
        password: 'test'
      });
      user.save(err => {
        if (err) throw err;
        console.log('create a user p5' + user);
        console.log(user);
      });
    }

    Project.find({user: user._id}, (err, projects) => {
      // console.log(projects);
      // if there are already some sketches, delete them
      if (projects.length > 0) {
        // projects.forEach(project => {
        //   Project.remove({_id: project._id}, err => {
        //     if (err) throw err;
        //     console.log('Projects successfully deleted!');
        //   });
        // });
      }
    });

    // create a new project for p5 user
    const project0 = new Project({
      name: projectName,
      user: user._id,
      files: [
        {
          name: 'root',
          id: r,
          _id: r,
          children: [a, b, c],
          fileType: 'folder'
        },
        {
          name: 'sketch.js',
          content: sketchContent,
          id: a,
          _id: a,
          isSelectedFile: true,
          fileType: 'file',
          children: []
        },
        {
          name: 'index.html',
          content: defaultHTML,
          id: b,
          _id: b,
          fileType: 'file',
          children: []
        },
        {
          name: 'style.css',
          content: defaultCSS,
          id: c,
          _id: c,
          fileType: 'file',
          children: []
        }
      ],
      _id: shortid.generate()
    });
    console.log('create a new project in p5 user' + project0);

    project0.save((err, savedProject) => {
      console.log('project is saved.');
    });
  });
}
