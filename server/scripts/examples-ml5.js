import fs from 'fs';
import rp from 'request-promise';
import Q from 'q';
import mongoose from 'mongoose';
import objectID from 'bson-objectid';
import shortid from 'shortid';
import User from '../models/user';
import Project from '../models/project';

// TODO: Change branchName if necessary
const branchName = 'release';
const branchRef = `?ref=${branchName}`;
const baseUrl = 'https://api.github.com/repos/ml5js/ml5-examples/contents';
const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;
const editorUsername = process.env.ML5_EXAMPLES_USERNAME;
const headers = {
  'User-Agent': 'p5js-web-editor/0.0.1'
};

const requestOptions = {
  url: baseUrl,
  qs: {
    client_id: clientId,
    client_secret: clientSecret
  },
  method: 'GET',
  headers,
  json: true
};

const mongoConnectionString = process.env.MONGO_URL;
mongoose.connect(mongoConnectionString, {
  useMongoClient: true
});
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * ---------------------------------------------------------
 * --------------------- helper functions --------------------
 * ---------------------------------------------------------
 */

/**
 * fatten a nested array
 */
function flatten(list) {
  return list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
}

/**
 * STEP 1: Get the top level cateogories
 */
async function getCategories() {
  try {
    const options = Object.assign({}, requestOptions);
    options.url = `${options.url}/p5js${branchRef}`;
    const results = await rp(options);

    return results;
  } catch (err) {
    return err;
  }
}

/**
 * STEP 2: Get the examples for each category
 * e.g. Posenet:
 *  - /posenet_image_single
 *  - /posenet_part_selection
 */
async function getCategoryExamples(sketchRootList) {
  const output = [];
  const sketchRootCategories = sketchRootList.map(async (categories) => {
    // let options = Object.assign({url: `${requestOptions.url}/${categories.path}${branchRef}`}, requestOptions)
    const options = Object.assign({}, requestOptions);
    options.url = `${options.url}${categories.path}${branchRef}`;
    // console.log(options)
    const sketchDirs = await rp(options);
    const result = flatten(sketchDirs);

    return result;
  });

  const sketchList = await Q.all(sketchRootCategories);

  sketchList.forEach((sketch) => {
    sketch.forEach((item) => {
      if (item.type === 'dir') output.push(item);
    });
  });

  return output;
}

/**
 *  STEP 3.1: Recursively get the tree of files for each directory
 *  @param parentObject - one sketch directory object
 */
async function traverseSketchTree(parentObject) {
  const output = Object.assign({}, parentObject);

  if (parentObject.type !== 'dir') {
    return output;
  }
  // let options = `https://api.github.com/repos/ml5js/ml5-examples/contents/${sketches.path}${branchRef}`
  const options = Object.assign({}, requestOptions);
  options.url = `${options.url}${parentObject.path}${branchRef}`;

  output.tree = await rp(options);

  output.tree = output.tree.map(file => traverseSketchTree(file));

  output.tree = await Q.all(output.tree);

  return output;
}

/**
 * STEP 3.2: Traverse the sketchtree for all of the sketches
 * @param {*} categoryExamples - all of the categories in an array
 */
async function traverseSketchTreeAll(categoryExamples) {
  // const sketches = categoryExamples.map(async sketch => await traverseSketchTree(sketch));
  const sketches = categoryExamples.map(async sketch => traverseSketchTree(sketch));

  const result = await Q.all(sketches);
  return result;
}

/**
 * Traverse the tree and format into parent child relation
 * @param {*} parentObject
 */
function traverseAndFormat(parentObject) {
  const parent = Object.assign({}, parentObject);

  if (!parentObject.tree) {
    const newid = objectID().toHexString();
    // returns the files
    return {
      name: parent.name,
      url: parent.download_url,
      content: null,
      id: newid,
      _id: newid,
      fileType: 'file'
    };
  }

  const subdir = parentObject.tree.map((item) => {
    const newid = objectID().toHexString();
    if (!item.tree) {
      // returns the files
      return {
        name: item.name,
        url: item.download_url,
        content: null,
        id: newid,
        _id: newid,
        fileType: 'file'
      };
    }

    const feat = {
      name: item.name,
      id: newid,
      _id: newid,
      fileType: 'folder',
      children: traverseAndFormat(item)
    };
    return feat;
  });
  return subdir;
}

/**
 * Traverse the tree and flatten for project.files[]
 * @param {*} projectFileTree
 */
function traverseAndFlatten(projectFileTree) {
  const r = objectID().toHexString();

  const projectRoot = {
    name: 'root',
    id: r,
    _id: r,
    children: [],
    fileType: 'folder'
  };

  let currentParent;

  const output = projectFileTree.reduce(
    (result, item, idx) => {
      if (idx < projectFileTree.length) {
        projectRoot.children.push(item.id);
      }

      if (item.fileType === 'file') {
        if (item.name === 'sketch.js') {
          item.isSelectedFile = true;
        }
        result.push(item);
      }

      // here's where the magic happens *twinkles*
      if (item.fileType === 'folder') {
        // recursively go down the tree of children
        currentParent = traverseAndFlatten(item.children);
        // the above will return an array of the children files
        // concatenate that with the results
        result = result.concat(currentParent); // eslint-disable-line no-param-reassign
        // since we want to get the children ids,
        // we can map the child ids to the current item
        // then push that to our result array to get
        // our flat files array.
        item.children = item.children.map(child => child.id);
        result.push(item);
      }

      return result;
    },
    [projectRoot]
  );

  // Kind of hacky way to remove all roots other than the starting one
  let counter = 0;
  output.forEach((item, idx) => {
    if (item.name === 'root') {
      if (counter === 0) {
        counter += 1;
      } else {
        output.splice(idx, 1);
        counter += 1;
      }
    }
  });

  return output;
}

/**
 * STEP 4
 * Take a parent directory and prepare it for injestion!
 * @param {*} sketch
 * @param {*} user
 */
function formatSketchForStorage(sketch, user) {
  const newProject = new Project({
    _id: shortid.generate(),
    name: sketch.name,
    user: user._id,
    files: [] // <== add files to this array as file objects and add _id reference to children of root
  });

  let projectFiles = traverseAndFormat(sketch);
  projectFiles = traverseAndFlatten(projectFiles);
  newProject.files = projectFiles;
  return newProject;
}

/**
 * format all the sketches using the formatSketchForStorage()
 */
function formatSketchForStorageAll(sketchWithItems, user) {
  let sketchList = sketchWithItems.slice(0);

  sketchList = sketchList.map(sketch => formatSketchForStorage(sketch, user));

  return sketchList;
}

/**
 * Get all the content for the relevant files in project.files[]
 * @param {*} projectObject
 */
async function fetchSketchContent(projectObject) {
  const output = Object.assign({}, JSON.parse(JSON.stringify(projectObject)));

  const newFiles = output.files.map(async (item, i) => {
    // if it is an html or js file
    if (
      (item.fileType === 'file' && item.name.endsWith('.html')) ||
      item.name.endsWith('.js')
    ) {
      const options = Object.assign({}, requestOptions);
      options.url = `${item.url}`;

      if (
        options.url !== undefined ||
        options.url !== null ||
        options.url !== ''
      ) {
        item.content = await rp(options);
        // NOTE: remove the URL property if there's content
        // Otherwise the p5 editor will try to pull from that url
        if (item.content !== null) delete item.url;
      }

      return item;
      // if it is NOT an html or js file
    }

    if (item.url) {
      const cdnRef = `https://cdn.jsdelivr.net/gh/ml5js/ml5-examples@${branchName}${
        item.url.split(branchName)[1]
      }`;
      item.content = cdnRef;
      item.url = cdnRef;
    }

    return item;
  });

  output.files = await Q.all(newFiles);
  return output;
}

/**
 * STEP 5
 * Get all the content for the relevant files in project.files[] for all sketches
 * @param {*} formattedSketchList
 */
async function fetchSketchContentAll(formattedSketchList) {
  let output = formattedSketchList.slice(0);

  output = output.map(async item => fetchSketchContent(item));

  output = await Q.all(output);

  return output;
}

/**
 * STEP 6
 * Remove existing projects, then fill the db
 * @param {*} filledProjectList
 * @param {*} user
 */
async function createProjectsInP5User(filledProjectList, user) {
  const userProjects = await Project.find({ user: user._id });
  const removeProjects = userProjects.map(async project => Project.remove({ _id: project._id }));
  await Q.all(removeProjects);
  console.log('deleted old projects!');

  const newProjects = filledProjectList.map(async (project) => {
    const item = new Project(project);
    console.log(`saving ${project.name}`);
    await item.save();
  });
  await Q.all(newProjects);
  console.log(`Projects saved to User: ${editorUsername}!`);
}

/**
 * STEP 0
 * CHECK if user exists, ifnot create one
 *
 */
async function checkP5User() {
  const user = await User.findOne({ username: editorUsername });

  if (!user) {
    const ml5user = new User({
      username: editorUsername,
      email: process.env.ML5_EXAMPLES_EMAIL,
      password: process.env.ML5_EXAMPLES_PASS
    });

    await ml5user.save((saveErr) => {
      if (saveErr) throw saveErr;
      console.log(`Created a user p5${ml5user}`);
    });
  }
}


/**
 * ---------------------------------------------------------
 * --------------------- main ------------------------------
 * ---------------------------------------------------------
 */

/**
 * MAKE
 * Get all the sketches from the ml5-examples repo
 * Get the p5 examples
 * Dive down into each sketch and get all the files
 * Format the sketch files to be save to the db
 * Delete existing and save
 */
async function make() {
  await checkP5User();
  // Get the user
  const user = await User.findOne({
    username: editorUsername
  });
  // Get the categories and their examples
  const categories = await getCategories();
  const categoryExamples = await getCategoryExamples(categories);
  const examplesWithResourceTree = await traverseSketchTreeAll(categoryExamples);
  const formattedSketchList = formatSketchForStorageAll(examplesWithResourceTree, user);
  const filledProjectList = await fetchSketchContentAll(formattedSketchList);
  await createProjectsInP5User(filledProjectList, user);
  console.log('done!');
  process.exit();
}

/**
 * TEST - same as make except reads from file for testing purposes
 * Get all the sketches from the ml5-examples repo
 * Get the p5 examples
 * Dive down into each sketch and get all the files
 * Format the sketch files to be save to the db
 * Delete existing and save
 */
async function test() {
  await checkP5User();
  // Get the user
  const user = await User.findOne({
    username: editorUsername
  });

  // read from file while testing
  const examplesWithResourceTree = JSON.parse(fs.readFileSync('./ml5-examplesWithResourceTree.json'));

  const formattedSketchList = formatSketchForStorageAll(examplesWithResourceTree, user);

  const filledProjectList = await fetchSketchContentAll(formattedSketchList);
  await createProjectsInP5User(filledProjectList, user);
  console.log('done!');
  process.exit();
}

/**
 * ---------------------------------------------------------
 * --------------------- Run -------------------------------
 * ---------------------------------------------------------
 * Usage:
 * If you're testing, change the make() function to test()
 * ensure when testing that you've saved some JSON outputs to
 * read from so you don't have to make a billion requests all the time
 *
 * $ GITHUB_ID=<....> GITHUB_SECRET=<...> NODE_ENV=development npm run fetch-examples-ml5
 * $ GITHUB_ID=<....> GITHUB_SECRET=<...> npm run fetch-examples-ml5
 */

if (process.env.NODE_ENV === 'development') {
  // test()
  make(); // replace with test() if you don't want to run all the fetch functions over and over
} else {
  make();
}
