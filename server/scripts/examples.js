import rp from 'request-promise';
import Q from 'q';
import mongoose from 'mongoose';
import objectID from 'bson-objectid';
import shortid from 'shortid';
import eachSeries from 'async/eachSeries';
import User from '../models/user';
import Project from '../models/project';

const defaultHTML =
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />
  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
`;

const defaultCSS =
  `html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
`;

const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;

const headers = { 'User-Agent': 'p5js-web-editor/0.0.1' };

const mongoConnectionString = process.env.MONGO_URL;

mongoose.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

async function getCategories() {
  const categories = [];
  const options = {
    url: 'https://api.github.com/repos/processing/p5.js-website/contents/src/data/examples/en',
    method: 'GET',
    headers: {
      ...headers,
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    json: true
  };
  try {
    const res = await rp(options);
    res.forEach((metadata) => {
      let category = '';
      for (let j = 1; j < metadata.name.split('_').length; j += 1) {
        category += `${metadata.name.split('_')[j]} `;
      }
      categories.push({ url: metadata.url, name: category.trim() });
    });
    return categories;
  } catch (error) {
    throw error;
  }
}

function getSketchesInCategories(categories) {
  return Q.all(categories.map(async (category) => {
    const options = {
      url: `${category.url.replace('?ref=main', '')}`,
      method: 'GET',
      headers: {
        ...headers,
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      json: true
    };
    try {
      const res = await rp(options);
      const projectsInOneCategory = [];
      res.forEach((example) => {
        let projectName;
        if (example.name === '02_Instance_Container.js') {
          for (let i = 1; i < 5; i += 1) {
            const instanceProjectName = `${category.name}: Instance Container ${i}`;
            projectsInOneCategory.push({ sketchUrl: example.download_url, projectName: instanceProjectName });
          }
        } else {
          if (example.name.split('_')[1]) {
            projectName = `${category.name}: ${example.name.split('_').slice(1).join(' ').replace('.js', '')}`;
          } else {
            projectName = `${category.name}: ${example.name.replace('.js', '')}`;
          }
          projectsInOneCategory.push({ sketchUrl: example.download_url, projectName });
        }
      });
      return projectsInOneCategory;
    } catch (error) {
      throw error;
    }
  }));
}

function getSketchContent(projectsInAllCategories) {
  return Q.all(projectsInAllCategories.map(projectsInOneCategory => Q.all(projectsInOneCategory.map(async (project) => {
    const options = {
      url: `${project.sketchUrl.replace('?ref=main', '')}`,
      method: 'GET',
      headers: {
        ...headers,
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      }
    };
    try {
      const res = await rp(options);
      const noNumberprojectName = project.projectName.replace(/(\d+)/g, '');
      if (noNumberprojectName === 'Instance Mode: Instance Container ') {
        for (let i = 0; i < 4; i += 1) {
          const splitedRes = `${res.split('*/')[1].split('</html>')[i]}</html>\n`;
          project.sketchContent = splitedRes.replace(
            'p5.js',
            'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.js'
          );
        }
      } else {
        project.sketchContent = res;
      }
      return project;
    } catch (error) {
      throw error;
    }
  }))));
}

async function addAssetsToProject(assets, response, project) {
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < assets.length; i += 1) { // iterate through each asset in the project in series (async/await functionality would not work with forEach() )
    const assetNamePath = assets[i];
    let assetName = assetNamePath.split('assets/')[1];
    let assetUrl = '';
    let assetContent = '';

    response.forEach((asset) => {
      if (asset.name === assetName || asset.name.split('.')[0] === assetName) {
        assetName = asset.name;
        assetUrl = asset.download_url;
      }
    });

    if (assetName !== '') {
      if (i === 0) {
        const id = objectID().toHexString();
        project.files.push({
          name: 'assets',
          id,
          _id: id,
          children: [],
          fileType: 'folder'
        });
        // add assets folder inside root
        project.files[0].children.push(id);
      }

      const fileID = objectID().toHexString();

      if (assetName.slice(-5) === '.vert' || assetName.slice(-5) === '.frag') { // check if the file has .vert or .frag extension
        const assetOptions = {
          url: assetUrl,
          method: 'GET',
          headers: {
            ...headers,
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          },
          json: true
        };

        // a function to await for the response that contains the content of asset file
        const doRequest = async (optionsAsset) => {
          try {
            const res = await rp(optionsAsset);
            return res;
          } catch (error) {
            throw error;
          }
        };

        assetContent = await doRequest(assetOptions);
        // push to the files array of the project only when response is received
        project.files.push({
          name: assetName,
          content: assetContent,
          id: fileID,
          _id: fileID,
          children: [],
          fileType: 'file'
        });
        console.log(`create assets: ${assetName}`);
        // add asset file inside the newly created assets folder at index 4
        project.files[4].children.push(fileID);
      } else { // for assets files that are not .vert or .frag extension
        project.files.push({
          name: assetName,
          url: `https://cdn.jsdelivr.net/gh/processing/p5.js-website@main/src/data/examples/assets/${assetName}`,
          id: fileID,
          _id: fileID,
          children: [],
          fileType: 'file'
        });
        console.log(`create assets: ${assetName}`);
        // add asset file inside the newly created assets folder at index 4
        project.files[4].children.push(fileID);
      }
    }
  }
  /* eslint-disable no-await-in-loop */
}


async function createProjectsInP5user(projectsInAllCategories) {
  const options = {
    url: 'https://api.github.com/repos/processing/p5.js-website/contents/src/data/examples/assets',
    method: 'GET',
    headers: {
      ...headers,
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    json: true
  };

  try {
    const res = await rp(options);
    User.findOne({ username: 'p5' }, (err, user) => {
      if (err) throw err;

      eachSeries(projectsInAllCategories, (projectsInOneCategory, categoryCallback) => {
        eachSeries(projectsInOneCategory, async (project, projectCallback) => {
          let newProject;
          const a = objectID().toHexString();
          const b = objectID().toHexString();
          const c = objectID().toHexString();
          const r = objectID().toHexString();
          const noNumberprojectName = project.projectName.replace(/(\d+)/g, '');
          if (noNumberprojectName === 'Instance Mode: Instance Container ') {
            newProject = new Project({
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
                  content: '// Instance Mode: Instance Container, please check its index.html file',
                  id: a,
                  _id: a,
                  fileType: 'file',
                  children: []
                },
                {
                  name: 'index.html',
                  content: project.sketchContent,
                  isSelectedFile: true,
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
          } else {
            newProject = new Project({
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
          }

          const assetsInProject = project.sketchContent.match(/assets\/[\w-]+\.[\w]*/g)
            || project.sketchContent.match(/asset\/[\w-]*/g) || [];

          await addAssetsToProject(assetsInProject, res, newProject);

          newProject.save((saveErr, savedProject) => {
            if (saveErr) throw saveErr;
            console.log(`Created a new project in p5 user: ${savedProject.name}`);
            projectCallback();
          });
        }, (categoryErr) => {
          categoryCallback();
        });
      }, (examplesErr) => {
        process.exit();
      });
    });
  } catch (error) {
    throw error;
  }
}

function getp5User() {
  console.log('Getting p5 user');
  User.findOne({ username: 'p5' }, async (err, user) => {
    if (err) throw err;

    let p5User = user;
    if (!p5User) {
      p5User = new User({
        username: 'p5',
        email: process.env.EXAMPLE_USER_EMAIL,
        password: process.env.EXAMPLE_USER_PASSWORD
      });
      p5User.save((saveErr) => {
        if (saveErr) throw saveErr;
        console.log(`Created a user p5 ${p5User}`);
      });
    }

    Project.find({ user: p5User._id }, (projectsErr, projects) => {
      // if there are already some sketches, delete them
      console.log('Deleting old projects...');
      projects.forEach((project) => {
        Project.remove({ _id: project._id }, (removeErr) => {
          if (removeErr) throw removeErr;
        });
      });
    });

    const categories = await getCategories();
    const sketchesInCategories = await getSketchesInCategories(categories);
    const sketchContent = await getSketchContent(sketchesInCategories);
    const projects = createProjectsInP5user(sketchContent);
    return projects;
  });
}

getp5User();
