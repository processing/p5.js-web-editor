import axios from 'axios';
import Q from 'q';
import mongoose from 'mongoose';
import objectID from 'bson-objectid';
import shortid from 'shortid';
import { defaultCSS, defaultHTML } from '../domain-objects/createDefaultFiles';
import User from '../models/user';
import Project from '../models/project';

const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;

const headers = { 'User-Agent': 'p5js-web-editor/0.0.1' };

const mongoConnectionString = process.env.MONGO_URL;

mongoose.connect(mongoConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('strictQuery', true);
mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Please make sure that MongoDB is running.'
  );
  process.exit(1);
});

async function getCategories() {
  const categories = [];
  const options = {
    url:
      'https://api.github.com/repos/processing/p5.js-website-legacy/contents/src/data/examples/en',
    method: 'GET',
    headers: {
      ...headers,
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString('base64')}`
    }
  };
  const { data } = await axios.request(options);
  data.forEach((metadata) => {
    let category = '';
    for (let j = 1; j < metadata.name.split('_').length; j += 1) {
      category += `${metadata.name.split('_')[j]} `;
    }
    categories.push({ url: metadata.url, name: category.trim() });
  });
  return categories;
}

function getSketchesInCategories(categories) {
  return Q.all(
    categories.map(async (category) => {
      const options = {
        url: `${category.url.replace('?ref=main', '')}`,
        method: 'GET',
        headers: {
          ...headers,
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString('base64')}`
        },
        json: true
      };
      const { data } = await axios.request(options);
      const projectsInOneCategory = [];
      data.forEach((example) => {
        let projectName;
        if (example.name === '02_Instance_Container.js') {
          for (let i = 1; i < 5; i += 1) {
            const instanceProjectName = `${category.name}: Instance Container ${i}`;
            projectsInOneCategory.push({
              sketchUrl: example.download_url,
              projectName: instanceProjectName
            });
          }
        } else {
          if (example.name.split('_')[1]) {
            projectName = `${category.name}: ${example.name
              .split('_')
              .slice(1)
              .join(' ')
              .replace('.js', '')}`;
          } else {
            projectName = `${category.name}: ${example.name.replace(
              '.js',
              ''
            )}`;
          }
          projectsInOneCategory.push({
            sketchUrl: example.download_url,
            projectName
          });
        }
      });
      return projectsInOneCategory;
    })
  );
}

function getSketchContent(projectsInAllCategories) {
  return Q.all(
    projectsInAllCategories.map((projectsInOneCategory) =>
      Q.all(
        projectsInOneCategory.map(async (project) => {
          const options = {
            url: `${project.sketchUrl.replace('?ref=main', '')}`,
            method: 'GET',
            headers: {
              ...headers,
              Authorization: `Basic ${Buffer.from(
                `${clientId}:${clientSecret}`
              ).toString('base64')}`
            }
          };
          const { data } = await axios.request(options);
          const noNumberprojectName = project.projectName.replace(/(\d+)/g, '');
          if (noNumberprojectName === 'Instance Mode: Instance Container ') {
            for (let i = 0; i < 4; i += 1) {
              const splitedRes = `${
                data.split('*/')[1].split('</html>')[i]
              }</html>\n`;
              project.sketchContent = splitedRes.replace(
                'p5.js',
                'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.js'
              );
            }
          } else {
            project.sketchContent = data;
          }
          return project;
        })
      )
    )
  );
}

async function addAssetsToProject(assets, response, project) {
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < assets.length; i += 1) {
    // iterate through each asset in the project in series (async/await functionality would not work with forEach() )
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

      if (assetName.slice(-5) === '.vert' || assetName.slice(-5) === '.frag') {
        // check if the file has .vert or .frag extension
        const assetOptions = {
          url: assetUrl,
          method: 'GET',
          headers: {
            ...headers,
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString('base64')}`
          }
        };

        // a function to await for the response that contains the content of asset file
        const doRequest = async (optionsAsset) => {
          const { data } = await axios.request(optionsAsset);
          return data;
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
      } else {
        // for assets files that are not .vert or .frag extension
        project.files.push({
          name: assetName,
          url: `https://cdn.jsdelivr.net/gh/processing/p5.js-website-legacy@main/src/data/examples/assets/${assetName}`,
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
    url:
      'https://api.github.com/repos/processing/p5.js-website-legacy/contents/src/data/examples/assets',
    method: 'GET',
    headers: {
      ...headers,
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString('base64')}`
    }
  };

  const { data } = await axios.request(options);
  const user = await User.findOne({ username: 'p5' }).exec();
  await Q.all(
    projectsInAllCategories.map((projectsInOneCategory) =>
      Q.all(
        projectsInOneCategory.map(async (project) => {
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
                  content:
                    '// Instance Mode: Instance Container, please check its index.html file',
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

          const assetsInProject =
            project.sketchContent.match(/assets\/[\w-]+\.[\w]*/g) ||
            project.sketchContent.match(/asset\/[\w-]*/g) ||
            [];

          await addAssetsToProject(assetsInProject, data, newProject);
          const savedProject = await newProject.save();
          console.log(`Created a new project in p5 user: ${savedProject.name}`);
        })
      )
    )
  );
  process.exit();
}

async function getp5User() {
  console.log('Getting p5 user');
  const user = await User.findOne({ username: 'p5' }).exec();
  let p5User = user;
  if (!p5User) {
    p5User = new User({
      username: 'p5',
      email: process.env.EXAMPLE_USER_EMAIL,
      password: process.env.EXAMPLE_USER_PASSWORD
    });
    await p5User.save();
    console.log(`Created a user p5 ${p5User}`);
  }
  const projects = await Project.find({ user: p5User._id }).exec();
  console.log('Deleting old projects...');
  projects.forEach(async (project) => {
    await Project.deleteOne({ _id: project._id });
  });
  const categories = await getCategories();
  const sketchesInCategories = await getSketchesInCategories(categories);
  const sketchContent = await getSketchContent(sketchesInCategories);
  const projectsInUser = await createProjectsInP5user(sketchContent);
  return projectsInUser;
}

getp5User();
