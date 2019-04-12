import rp from 'request-promise';
import Q from 'q';
import mongoose, {
  Query
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
  // fs.writeFileSync('ml5-examplesWithResourceTree.json', JSON.stringify(examplesWithResourceTree))

  // Create a Project with the specified model specifications

  // Get the content for all of the children of the Project

  // Delete all the old projects

  // Add in the Projects to the User



  // sketchCategoryList = await appendSketchItemLinks(sketchCategoryList)
  // let sketchWithItems = await getSketchItems(sketchCategoryList)
  // let formattedSketches = await formatAllSketches(sketchWithItems)
  // let sketchesWithContent = await getAllSketchContent(formattedSketches);
  // createProjectsInP5user(sketchesWithContent)

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

  // Create a Project with the specified model specifications
  // let emptyProject = formatSketchForStorage(examplesWithResourceTree[0], user)
  let projectFiles = traverseAndFormat(examplesWithResourceTree[0])
  projectFiles = traverseAndFlatten(projectFiles);
  console.log(JSON.stringify(projectFiles))
  console.log("----------")
  console.log("----------")
  console.log("----------")
  // console.log(newProject)
  // let filledProject = traverseAndFillProject(emptyProject, examplesWithResourceTree[0])
  
  // console.log(JSON.stringify(filledProject));
  // Get the content for all of the children of the Project

  // Delete all the old projects

  // Add in the Projects to the User

}




if (process.env.TEST == 'DEV') {
  test()
} else {
  make()
}




// get the sketch download url
function getItemDownloadUrl(item, itemName) {
  let content = item.tree.find(item => item.name === itemName);
  if (content) {
    return content.download_url
  } else {
    return null
  }
}

/**
 * Take a parent directory and prepare it for injestion!
 * @param {*} sketch 
 * @param {*} user 
 */
function formatSketchForStorage(sketch, user) {

  const r = objectID().toHexString();
  let newProject = new Project({
    _id: shortid.generate(),
    name: sketch.name,
    user: user._id,
    files: [{
      name: 'root',
      id: r,
      _id: r,
      children: [],
      fileType: 'folder'
    }] // <== add files to this array as file objects and add _id reference to children of root 
  })

  return newProject;
};

function traverseAndFormat(parentObject) {
  const parent = Object.assign({}, parentObject);

  if (!parentObject.hasOwnProperty('tree')) {
      const newid = objectID().toHexString();
      // returns the files
      return {
          name: parent.name,
          content: parent.download_url,
          id: 'newid',
          _id: 'newid',
          fileType: 'file'
      }
  }

  const subdir = parentObject.tree.map(item => {
      const newid = objectID().toHexString();
      if (!item.hasOwnProperty('tree')) {
          // returns the files
          return {
              name: item.name,
              content: item.download_url,
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

function traverseAndFlatten(sample2){

  const r = objectID().toHexString();
  
  let projectRoot = {
    name: 'root',
    id: r,
    _id: r,
    children: [],
    fileType: 'folder'
  }

  let currentParent;

  let output = sample2.reduce( (result, item, idx) => {

      if(idx < sample2.length){
          projectRoot.children.push(item.id);
      }

      if(item.fileType == 'file'){
          result.push(item);
      } 
      
      // here's where the magic happens *twinkles*
      if(item.fileType == 'folder'){
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
  output.forEach( (item, idx) => {
      if(item.name == 'root'){
          if(counter == 0){
              counter++;
          } else {
              output.splice(idx, 1)
              counter++;
          }
          
      }
  });

  return output;    
}



// add in the child._id reference to the root.children[]
// parentObject.tree.forEach((child, idx) => {
//   const newid = objectID().toHexString();
  
//   if (child.type === 'dir') {
//     let feature = {
//       name: child.name,
//       id: newid,
//       _id: newid,
//       children: [],
//       fileType: 'folder'
//     }
//     // result = traverseAndFillProject(project, child)
//     // return feature;
//     project.files[0].children.push(feature.id);
//     project.files.push(feature)

//   } else if (child.type === 'file') {
//     let feature = {
//       name: child.name,
//       content: child.download_url,
//       id: newid,
//       _id: newid,
//       fileType: 'file'
//     }
//     project.files[0].children.push(feature.id);
//     project.files.push(feature)
//   }

// })

// create a new project template
// const a = objectID().toHexString();
// const b = objectID().toHexString();
// const r = objectID().toHexString();

// {
//   name: 'root',
//   id: r,
//   _id: r,
//   children: [a, b],
//   fileType: 'folder'
// },
// {
//   name: 'sketch.js',
//   content: getItemDownloadUrl(sketch, 'sketch.js'),
//   id: a,
//   _id: a,
//   isSelectedFile: true,
//   fileType: 'file',
//   children: []
// },
// {
//   name: 'index.html',
//   content: getItemDownloadUrl(sketch, 'index.html'),
//   id: b,
//   _id: b,
//   fileType: 'file',
//   children: []
// }

// function traverseAndFillProject(project, parentObject){
//   let parent = Object.assign({}, parentObject);
//   let output = Object.assign({}, project);
//   let result;
//   // if the parent has no more children return
//   if(!parent.hasOwnProperty('tree')){
//     return output;
//   }


//   return output
// }


// async function testFormatAllSketches(examplesWithResourceTree){
//   let user = await  User.findOne({username: 'ml5'})

//   formatSketchForStorage(examplesWithResourceTree[0], user)
// }


// // format all the sketches using the formatSketchForStorage()
// function formatAllSketches(sketchWithItems) {
//   return new Promise((resolve, reject) => {
//     User.findOne({
//       username: 'ml5'
//     }, (err, user) => {
//       const output = [];
//       sketchWithItems.forEach((sketch) => {
//         const newProject = formatSketchForStorage(sketch, user);
//         output.push(newProject);
//       });
//       resolve(output);
//     });
//   });
// }

// async function getAllSketchContent(newProjectList) {
//   let output = newProjectList.map(async (newProject) => {

//     let filesToDownload = newProject.files.map(async (sketchFile, i) => {
//       if (sketchFile.fileType === 'file' &&
//         sketchFile.content != null &&
//         sketchFile.name.endsWith('.html') === true ||
//         sketchFile.name.endsWith('.js') === true
//       ) {
//         requestOptions.url = sketchFile.content

//         if (requestOptions.url !== null) {
//           sketchFile.content = await rp(requestOptions)
//         }

//         return sketchFile
//       }
//     })
//     newProject.files = await Q.all(filesToDownload);
//     console.log(newProject.files.length)
//     newProject.files = newProject.files.filter(item => item != null)
//     console.log(newProject.files.length)
//     return newProject;
//   });
//   let result = await Q.all(output)

//   return result
// }

// // Save the project in the db

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

// // get all the sketch data content and download to the newProjects array
// function getAllSketchContent(newProjectList) {
//   /* eslint-disable */
//   return Q.all(newProjectList.map(newProject => Q.all(newProject.files.map((sketchFile, i) => {
//     /*
//       sketchFile.name.endsWith(".mp4") !== true &&
//       sketchFile.name.endsWith(".ogg") !== true &&
//       sketchFile.name.endsWith(".otf") !== true &&
//       sketchFile.name.endsWith(".ttf") !== true &&
//       sketchFile.name.endsWith(".vvt") !== true &&
//       sketchFile.name.endsWith(".jpg") !== true &&
//       sketchFile.name.endsWith(".png") !== true &&
//       sketchFile.name.endsWith(".svg") !== true
//     */

//     if (sketchFile.fileType === 'file' &&
//       sketchFile.content != null &&
//       sketchFile.name.endsWith('.html') === true ||
//       sketchFile.name.endsWith('.js') === true
//     ) {
//       const options = {
//         url: newProject.files[i].content,
//         qs: {
//           client_id: clientId,
//           client_secret: clientSecret
//         },
//         method: 'GET',
//         headers
//       };

//       // console.log("CONVERT ME!")
//       return rp(options).then((res) => {
//         newProject.files[i].content = res;
//         return newProject;
//       }).catch((err) => {
//         throw err;
//       });
//     }
//     if (newProject.files[i].url) {
//       return new Promise((resolve, reject) => {
//         // "https://raw.githubusercontent.com/generative-design/Code-Package-p5.js/gg4editor/01_P/P_3_2_1_01/data/FreeSans.otf",
//         // https://cdn.jsdelivr.net/gh/generative-design/Code-Package-p5.js@master/01_P/P_4_3_1_01/data/pic.png
//         // const rawGitRef = `https://raw.githack.com/${newProject.files[i].url.split('.com/')[1]}`;
//         const cdnRef = `https://cdn.jsdelivr.net/gh/generative-design/Code-Package-p5.js@${branchName}${newProject.files[i].url.split(branchName)[1]}`
//         // console.log("🌈🌈🌈🌈🌈", sketchFile.name);
//         // console.log("🌈🌈🌈🌈🌈", cdnRef);
//         sketchFile.content = cdnRef;
//         sketchFile.url = cdnRef;
//         // newProject.files[1].content = newProject.files[1].content.replace(`'data/${sketchFile.name}'`, `'${rawGitRef}'`);
//         resolve(newProject);
//       });
//     }
//   })).catch((err) => {
//     throw err;
//   }))).then(() => newProjectList);
//   /* eslint-enable */
// }


// // TODO: left off here!
// result = parent.tree
//           .map( (item, idx, arr) => {
//             if(item.type === 'dir'){
//               const objId = objectID().toHexString();
//               const newDir = {
//                 name: item.name,
//                 id: objId,
//                 _id: objId,
//                 children: [],
//                 fileType: 'folder'
//               }
//               return traverseAndFillProject(newDir, item)
//             } else {
//               const fileId = objectID().toHexString();
//               const newFile = {
//                 name: item.hasOwnProperty('name') || null,
//                 id: fileId,
//                 _id: fileId,
//                 children: [],
//                 fileType: 'file'
//               }
//               return newFile
//             }
//           })