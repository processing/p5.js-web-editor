import rp from 'request-promise';
import Q from 'q';
import mongoose, {
  Query,
  Types
} from 'mongoose';
import objectID from 'bson-objectid';
import shortid from 'shortid';
import eachSeries from 'async/eachSeries';
import User from '../models/user';
import Project from '../models/project';
import fs from 'fs';
 

// TODO: Change branchName if necessary
const branchName = 'release';
const ml5version = '0.2.3';
const p5version = '0.7.3';
const branchRef = `?ref=${branchName}`;
const baseUrl = `https://api.github.com/repos/ml5js/ml5-examples/contents`
const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;
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
}

const mongoConnectionString = process.env.MONGO_URL;

mongoose.connect(mongoConnectionString, {
  useMongoClient: true
});
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


function flatten(list) {
  return list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
};


/**
 * STEP 1: Get the top level cateogories
 */
async function getCategories() {
  try {
    let options = Object.assign({}, requestOptions);
    options.url = `${options.url}/p5js${branchRef}`
    const results = await rp(options)

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
  let output = [];
  const sketchRootCategories = sketchRootList.map(async (categories) => {
    // let options = Object.assign({url: `${requestOptions.url}/${categories.path}${branchRef}`}, requestOptions)
    let options = Object.assign({}, requestOptions);
    options.url = `${options.url}${categories.path}${branchRef}`
    // console.log(options)
    const sketchDirs = await rp(options);
    const result = flatten(sketchDirs)

    return result
  })

  let sketchList = await Q.all(sketchRootCategories)

  sketchList.forEach(sketch => {
    sketch.forEach(item => {
      if (item.type === 'dir') output.push(item)
    })
  })

  return output;
}

/**
 *  STEP 3.1: Recursively get the tree of files for each directory
 *  @param parentObject - one sketch directory object
 */
async function traverseSketchTree(parentObject) {
  let output = Object.assign({}, parentObject);

  if (parentObject.type !== 'dir') {
    return output;
  }
  // let options = `https://api.github.com/repos/ml5js/ml5-examples/contents/${sketches.path}${branchRef}`
  let options = Object.assign({}, requestOptions);
  options.url = `${options.url}${parentObject.path}${branchRef}`

  output.tree = await rp(options)

  output.tree = output.tree.map(file => {
    return traverseSketchTree(file)
  })

  output.tree = await Q.all(output.tree);

  return output
}

/**
 * STEP 3.2: Traverse the sketchtree for all of the sketches
 * @param {*} categoryExamples - all of the categories in an array
 */
async function traverseSketchTreeAll(categoryExamples) {
  let sketches = categoryExamples.map(async (sketch) => {
    return await traverseSketchTree(sketch)
  })

  let result = await Q.all(sketches)
  return result;
}



async function make() {
  // Get the user
  const user = await User.find({
    username: 'ml5'
  });

  // Get the categories and their examples
  const categories = await getCategories();
  const categoryExamples = await getCategoryExamples(categories)
  // Get the examples and their nested resources
  const examplesWithResourceTree = await traverseSketchTreeAll(categoryExamples)
  const formattedSketchList = formatAllSketchesForStorage(examplesWithResourceTree, user)
  const filledProjectList = await fetchSketchContentAll(formattedSketchList)
  // fs.writeFileSync('ml5-filledProjectList.json', JSON.stringify(filledProjectList))
  console.log("----------")
  console.log("----------")
  console.log("----------")
  await createProjectsInP5User(filledProjectList, user)

  console.log('done!')
  return
}

async function test() {
  // Get the user
  const user = await User.find({
    username: 'ml5'
  });

  // 
  // ...
  ///


  // checkpoint 1
  const examplesWithResourceTree = JSON.parse(fs.readFileSync('./ml5-examplesWithResourceTree.json'));
  // console.log(examplesWithResourceTree[0])

  const formattedSketchList = formatAllSketchesForStorage(examplesWithResourceTree, user)
  // console.log(JSON.stringify(formattedSketchList))
  const filledProjectList = await fetchSketchContentAll(formattedSketchList)
  // fs.writeFileSync('ml5-filledProjectList.json', JSON.stringify(filledProjectList))
  console.log("----------")
  console.log("----------")
  console.log("----------")
  await createProjectsInP5User(filledProjectList, user)
}


if (process.env.TEST == 'DEV') {
  test()
} else {
  make()
}




// // get the sketch download url
// function getItemDownloadUrl(item, itemName) {
//   let content = item.tree.find(item => item.name === itemName);
//   if (content) {
//     return content.download_url
//   } else {
//     return null
//   }
// }

/**
 * Take a parent directory and prepare it for injestion!
 * @param {*} sketch 
 * @param {*} user 
 */
function formatSketchForStorage(sketch, user) {
  let newProject = new Project({
    _id: shortid.generate(),
    name: sketch.name,
    user: user[0]._id,
    files: [] // <== add files to this array as file objects and add _id reference to children of root 
  })

  let projectFiles = traverseAndFormat(sketch)
  projectFiles = traverseAndFlatten(projectFiles);
  newProject.files = projectFiles;
  return newProject;
};


// // format all the sketches using the formatSketchForStorage()
function formatAllSketchesForStorage(sketchWithItems, user) {
  let sketchList = sketchWithItems.slice(0,);
  
  sketchList = sketchList.map((sketch) => {
    return formatSketchForStorage(sketch, user);
  });

  return sketchList;
}

function traverseAndFormat(parentObject) {
  const parent = Object.assign({}, parentObject);

  if (!parentObject.hasOwnProperty('tree')) {
    const newid = objectID().toHexString();
    // returns the files
    return {
      name: parent.name,
      url: parent.download_url,
      content: null,
      id: newid,
      _id: newid,
      fileType: 'file'
    }
  }

  const subdir = parentObject.tree.map(item => {
    const newid = objectID().toHexString();
    if (!item.hasOwnProperty('tree')) {
      // returns the files
      return {
        name: item.name,
        url: item.download_url,
        content: null,
        id: newid,
        _id: newid,
        fileType: 'file'
      }
    } else {
      const feat = {
        name: item.name,
        id: newid,
        _id: newid,
        fileType: 'folder',
        children: traverseAndFormat(item)
      }
      return feat
    }
  })
  return subdir
}

function traverseAndFlatten(projectFileTree) {

  const r = objectID().toHexString();

  let projectRoot = {
    name: 'root',
    id: r,
    _id: r,
    children: [],
    fileType: 'folder'
  }

  let currentParent;

  let output = projectFileTree.reduce((result, item, idx) => {

    if (idx < projectFileTree.length) {
      projectRoot.children.push(item.id);
    }

    if (item.fileType == 'file') {
      if (item.name == 'sketch.js') {
        item.isSelectedFile = true
      }
      result.push(item);
    }

    // here's where the magic happens *twinkles*
    if (item.fileType == 'folder') {
      // recursively go down the tree of children
      currentParent = traverseAndFlatten(item.children);
      // the above will return an array of the children files
      // concatenate that with the results
      result = result.concat(currentParent);
      // since we want to get the children ids,
      // we can map the child ids to the current item
      // then push that to our result array to get 
      // our flat files array.
      item.children = item.children.map(child => {
        return child.id
      })
      result.push(item);
    }

    return result;
  }, [projectRoot]);

  // Kind of hacky way to remove all roots other than the starting one
  let counter = 0
  output.forEach((item, idx) => {
    if (item.name == 'root') {
      if (counter == 0) {
        counter++;
      } else {
        output.splice(idx, 1)
        counter++;
      }

    }
  });

  return output;
}

async function fetchSketchContentAll(formattedSketchList){
  let output = formattedSketchList.slice(0,);

  output = output.map( async (item) => {
    return await fetchSketchContent(item)
  })

  output = await Q.all(output);

  return output;
}

async function fetchSketchContent(projectObject){
  let output = Object.assign({}, JSON.parse(JSON.stringify(projectObject)));

  let newFiles = output.files.map( async (item, i) => {

      // if it is an html or js file
      if(item.fileType == 'file' && item.name.endsWith('.html') || item.name.endsWith('.js')){
        let options = Object.assign({}, requestOptions);
        options.url = `${item.url}`
        
        if (options.url !== null || options.url !== '') {
          item.content = await rp(options)
        }

        return item
      // if it is NOT an html or js file
      } else {
        if(item.hasOwnProperty('url')){
          const cdnRef = `https://cdn.jsdelivr.net/gh/ml5js/ml5-examples@${branchName}${item.url.split(branchName)[1]}`
          item.content = cdnRef;
          item.url = cdnRef;
        }
        
        return item;
      } 
  })

  output.files = await Q.all(newFiles);
  return output
}

async function createProjectsInP5User(filledProjectList, user){
  let userProjects = await Project.find({user:user._id});
  let removeProjects = userProjects.map( async (project) => {
    return await Project.remove({_id: project._id});
  })
  await Q.all(removeProjects);
  console.log("deleted old projects!")

  let newProjects = filledProjectList.map( async(project) => {
    let item = new Project(project);
    return await item.save()
  })
  await Q.all(newProjects);
  console.log("Projects saved to User!")


}


// function createProjectsInP5user(newProjectList) {
//   User.findOne({
//     username: 'ml5'
//   }, (err, user) => {
//     if (err) throw err;

//     Project.find({ user: user._id }, (projectsErr, projects) => {
//       // if there are already some sketches, delete them
//       console.log('Deleting old projects...');
//       projects.forEach((project) => {
//         Project.remove({ _id: project._id }, (removeErr) => {
//           if (removeErr) throw removeErr;
//         });
//       });
//     });

//     eachSeries(newProjectList, (newProject, sketchCallback) => {
//       newProject.save((saveErr, savedProject) => {
//         if (saveErr) throw saveErr;
//         console.log(`Created a new project in p5 user: ${savedProject.name}`);
//         sketchCallback();
//       });
//     });
//   });
// }

// Save the project in the db
// function createProjectsInP5user(newProjectList) {
//   User.findOne({ username: 'generative-design' }, (err, user) => {
//     if (err) throw err;

//     eachSeries(newProjectList, (newProject, sketchCallback) => {
//       newProject.save((saveErr, savedProject) => {
//         if (saveErr) throw saveErr;
//         console.log(`Created a new project in p5 user: ${savedProject.name}`);
//         sketchCallback();
//       });
//     });
//   });
// }
