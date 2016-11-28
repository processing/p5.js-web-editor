import rp from 'request-promise';
import Q from 'q';
import mongoose from 'mongoose';
import objectID from 'bson-objectid'
import shortid from 'shortid';
import User from './models/user';
import Project from './models/project';

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

const a = objectID().toHexString();
const b = objectID().toHexString();
const c = objectID().toHexString();
const r = objectID().toHexString();

const client_id = process.env.GITHUB_ID;
const client_secret = process.env.GITHUB_SECRET;

const headers = {'User-Agent': 'p5js-web-editor/0.0.1'};

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

getp5User();

function getp5User() {
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
        console.log('Created a user p5' + user);
      });
    }

    Project.find({user: user._id}, (err, projects) => {
      // if there are already some sketches, delete them
      console.log('Deleting old projects...');
      projects.forEach(project => {
        Project.remove({_id: project._id}, err => {
          if (err) throw err;
        });
      });
    });

    return getCategories()
      .then(getSketchesInCategories)
      .then(getSketchContent)
      .then(createProjectsInP5user);
  });
}

function getCategories() {
  let categories = [];
  const options = {
    url: 'https://api.github.com/repos/processing/p5.js-website/contents/dist/assets/examples/en?client_id='+
    client_id+'&client_secret='+client_secret,
    method: 'GET',
    headers: headers
  };
  return rp(options).then(res => {
    const json = JSON.parse(res);

    json.forEach(metadata => {
      let category = '';
      for (let j = 1; j < metadata.name.split('_').length; j++) {
        category += metadata.name.split('_')[j] + ' ';
      }
      categories.push({url: metadata.url, name: category});
    });

    return categories;
  }).catch(err => {
    throw err;
  });
}

function getSketchesInCategories(categories) {
  return Q.all(categories.map(category => {
    const options = {
      url: category.url.replace('?ref=master', '')+'?client_id='+client_id+'&client_secret='+client_secret,
      method: 'GET',
      headers: headers
    };

    return rp(options).then(res => {
      let projectsInOneCategory = [];
      const examples = JSON.parse(res);
      examples.forEach(example => {
        let projectName;
        if (example.name.split('_')[1]) {
          projectName = category.name + ': '+ example.name.split('_').slice(1).join(' ').replace('.js', '');
        } else {
          projectName = category.name + ': '+ example.name.replace('.js', '');
        }
        projectsInOneCategory.push({sketchUrl: example.download_url, projectName: projectName});
      });
      return projectsInOneCategory;
    }).catch(err => {
      throw err;
    });

  }));
}

function getSketchContent(projectsInAllCategories) {
  return Q.all(projectsInAllCategories.map(projectsInOneCategory => {
    return Q.all(projectsInOneCategory.map(project =>  {
      const options = {
        url: project.sketchUrl.replace('?ref=master', '')+'?client_id='+client_id+'&client_secret='+client_secret,
        method: 'GET',
        headers: headers
      };

      return rp(options).then(res => {
        project.sketchContent = res;
        return project;
      }).catch(err => {
        throw err;
      });
    }));
  }));
}

function createProjectsInP5user(projectsInAllCategories) {
  let assetsfiles = [];
  const options = {
    url: 'https://api.github.com/repos/processing/p5.js-website/contents/dist/assets/examples/assets?client_id='+
    client_id+'&client_secret='+client_secret,
    method: 'GET',
    headers: headers
  };

  rp(options).then(res => {
    const assets = JSON.parse(res);

    User.findOne({username: 'p5'}, (err, user) => {
      if (err) throw err;

      projectsInAllCategories.forEach(projectsInOneCategory => {
        projectsInOneCategory.forEach(project => {
          let newProject = new Project({
            name: project.projectName,
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
                content: project.sketchContent,
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

          let assetsInProject = project.sketchContent.match(/assets\/[\w-]+\.[\w]*/g) || project.sketchContent.match(/assets\/[\w-]*/g) || [];
          // if (assetsInProject === []) {
          //   assetsInProject = project.sketchContent.match(/assets\/[\w-]*/g) || [];
          // }

          assetsInProject.forEach((assetName, i) => {
            assetName = assetName.split('assets/')[1];

            assets.forEach(asset => {
              if (asset.name === assetName || asset.name.split('.')[0] === assetName) {
                assetName = asset.name;
              }
            });
            if (i === 0) {
              const id = objectID().toHexString();
              newProject.files.push({
                name: 'assets',
                id,
                _id: id,
                children: [],
                fileType: 'folder'
              });
              // add assets folder inside root
              newProject.files[0].children.push(id);
            }

            const fileID = objectID().toHexString();
            newProject.files.push({
              name: assetName,
              url: `https://raw.githubusercontent.com/processing/p5.js-website/master/dist/assets/examples/assets/${assetName}?client_id=${
    client_id}&client_secret=${client_secret}`,
              id: fileID,
              _id: fileID,
              children: [],
              fileType: 'file'
            });
            console.log('create assets: ' + assetName);
            // add asset file inside the newly created assets folder at index 4
            newProject.files[4].children.push(fileID);
          });
          newProject.save( (err, newProject) => {
            if (err) throw err;
            console.log('Created a new project in p5 user: ' + newProject.name);
          });

        });
      });
    });

  }).catch(err => {
    throw err;
  });
}
