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

async function make() {
  const categories = await getCategories();
  const categoryExamples = await getCategoryExamples(categories)
  
  let test = await traverseSketchTreeAll(categoryExamples)

  // console.log(JSON.stringify(test))
  fs.writeFileSync('ml5-example.json', JSON.stringify(test))
  // sketchCategoryList = await appendSketchItemLinks(sketchCategoryList)
  // let sketchWithItems = await getSketchItems(sketchCategoryList)
  // let formattedSketches = await formatAllSketches(sketchWithItems)
  // let sketchesWithContent = await getAllSketchContent(formattedSketches);

  // console.log(sketchesWithContent)
  // createProjectsInP5user(sketchesWithContent)

}
make();


/**
 * Get the top level cateogories
 */
async function getCategories() {
  try {
    let options =  Object.assign({}, requestOptions);
    options.url = `${options.url}/p5js${branchRef}`
    console.log(options)
    const results = await rp(options)

    // get the p5js and javascript directories
    // const sketchRootList = results.filter( (metadata) => metadata.name == 'p5js' || metadata.name === 'javascript')
    // Only get the p5 examples for now
    // const sketchRootList = results.filter( (metadata) => metadata.name == 'p5js' || metadata.name === 'javascript')

    return results;
  } catch (err) {
    return err;
  }
}

/**
 * Get the examples for each category
 * e.g. Posenet:
 *  - /posenet_image_single
 *  - /posenet_part_selection
 */
async function getCategoryExamples(sketchRootList) {
  let output = [];
  const sketchRootCategories = sketchRootList.map(async (categories) => {
    // let options = Object.assign({url: `${requestOptions.url}/${categories.path}${branchRef}`}, requestOptions)
    let options =  Object.assign({}, requestOptions);
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
 *  Recursively get the tree of files for each directory
 * 
 */

async function traverseSketchTree(parentObject){
  let output = Object.assign({}, parentObject);

  if(parentObject.type !== 'dir'){
    return output;
  }
  // let options = `https://api.github.com/repos/ml5js/ml5-examples/contents/${sketches.path}${branchRef}`
  let options =  Object.assign({}, requestOptions);
  options.url = `${options.url}${parentObject.path}${branchRef}`
  
  output.tree = await rp(options)

  output.tree = output.tree.map(file => {
    return traverseSketchTree(file)
  })

  output.tree = await Q.all(output.tree);
  
  return output
}

async function traverseSketchTreeAll(categoryExamples){
  let sketches = categoryExamples.map( async (sketch) => {
    return await traverseSketchTree(sketch)
  })
  
  let result = await Q.all(sketches)
  return result;
}



async function appendSketchItemLinks(sketchCategoryList) {
  const sketchList = sketchCategoryList.map(async (sketches) => {
    requestOptions.url = `https://api.github.com/repos/ml5js/ml5-examples/contents/${sketches.path}${branchRef}`

    const sketchItems = await rp(requestOptions);
    sketches.tree = sketchItems

    return sketches;
  })

  const output = await Q.all(sketchList)
  return output
}




async function getSketchItems(sketchList) {
  const sketches = sketchList.map(async (sketch) => {
    const sketchTree = sketch.tree.map(async (item) => {

      if (item.type === 'dir') {
        requestOptions.url = `https://api.github.com/repos/ml5js/ml5-examples/contents/${item.path}${branchRef}`
        let subdirectory = await rp(requestOptions)
        // console.log(subdirectory)
        // if(subdirectory.type === 'dir'){
        //   requestOptions.url = `https://api.github.com/repos/ml5js/ml5-examples/contents/${subdirectory.path}${branchRef}`
        //   let subsubdirectory = await rp(requestOptions)
        //   console.log(subsubdirectory)
        //   subdirectory.tree = subsubdirectory
        // }
        item.tree = subdirectory
      }
      return item
    })
    sketch.tree = await Q.all(sketchTree)
    return sketch
  })

  let result = await Q.all(sketches);
  return result;
}



// get the sketch download url
function getItemDownloadUrl(sketch, itemName) {
  let content = sketch.tree.find(item => item.name === itemName);
  if (content) {
    return content.download_url
  } else {
    return null
  }
}

function formatSketchForStorage(sketch, user) {

  // create a new project template
  const a = objectID().toHexString();
  const b = objectID().toHexString();
  // const c = objectID().toHexString();
  const r = objectID().toHexString();

  const newProject = new Project({
    name: sketch.name,
    user: user._id,
    files: [{
        name: 'root',
        id: r,
        _id: r,
        children: [a, b],
        fileType: 'folder'
      },
      {
        name: 'sketch.js',
        content: getItemDownloadUrl(sketch, 'sketch.js'),
        id: a,
        _id: a,
        isSelectedFile: true,
        fileType: 'file',
        children: []
      },
      {
        name: 'index.html',
        content: getItemDownloadUrl(sketch, 'index.html'),
        id: b,
        _id: b,
        fileType: 'file',
        children: []
      }
    ],
    _id: shortid.generate()
  })
  // newProject.files = addAdditionalJs(sketch, newProject);
  // newProject.files = fillDataFolder(sketch, newProject);

  return newProject;
};


// format all the sketches using the formatSketchForStorage()
function formatAllSketches(sketchWithItems) {
  return new Promise((resolve, reject) => {
    User.findOne({
      username: 'ml5'
    }, (err, user) => {
      const output = [];
      sketchWithItems.forEach((sketch) => {
        const newProject = formatSketchForStorage(sketch, user);
        output.push(newProject);
      });
      resolve(output);
    });
  });
}

async function getAllSketchContent(newProjectList) {
  let output = newProjectList.map(async (newProject) => {

    let filesToDownload = newProject.files.map(async (sketchFile, i) => {
      if (sketchFile.fileType === 'file' &&
        sketchFile.content != null &&
        sketchFile.name.endsWith('.html') === true ||
        sketchFile.name.endsWith('.js') === true
      ) {
        requestOptions.url = sketchFile.content

        if (requestOptions.url !== null) {
          sketchFile.content = await rp(requestOptions)
        }

        return sketchFile
      }
    })
    newProject.files = await Q.all(filesToDownload);
    console.log(newProject.files.length)
    newProject.files = newProject.files.filter(item => item != null)
    console.log(newProject.files.length)
    return newProject;
  });
  let result = await Q.all(output)

  return result
}

// Save the project in the db

function createProjectsInP5user(newProjectList) {
  User.findOne({
    username: 'ml5'
  }, (err, user) => {
    if (err) throw err;

    Project.find({ user: user._id }, (projectsErr, projects) => {
      // if there are already some sketches, delete them
      console.log('Deleting old projects...');
      projects.forEach((project) => {
        Project.remove({ _id: project._id }, (removeErr) => {
          if (removeErr) throw removeErr;
        });
      });
    });

    eachSeries(newProjectList, (newProject, sketchCallback) => {
      newProject.save((saveErr, savedProject) => {
        if (saveErr) throw saveErr;
        console.log(`Created a new project in p5 user: ${savedProject.name}`);
        sketchCallback();
      });
    });
  });
}

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