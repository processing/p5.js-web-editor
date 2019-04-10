import rp from 'request-promise';
import Q from 'q';
import mongoose from 'mongoose';
import objectID from 'bson-objectid';
import shortid from 'shortid';
import eachSeries from 'async/eachSeries';
import User from '../models/user';
import Project from '../models/project';


// TODO: Change branchName if necessary
const branchName = 'release';
const ml5version = '0.2.3';
const p5version = '0.7.3';
const branchRef = `?ref=${branchName}`;
const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;
const headers = { 'User-Agent': 'p5js-web-editor/0.0.1' };

let requestOptions = {
      url: null,
      qs: {
        client_id: clientId,
        client_secret: clientSecret
      },
      method: 'GET',
      headers,
      json: true
}

const mongoConnectionString = process.env.MONGO_URL;

mongoose.connect(mongoConnectionString, { useMongoClient: true });
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


function flatten(list) {
  return list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
};

async function make(){
  const sketchRootList = await getExamplesCategories();
  // console.log(sketchRootList)
  let sketchCategoryList = await getCategoryDirectories(sketchRootList)
  

  sketchCategoryList = await appendSketchItemLinks(sketchCategoryList)
  console.log(JSON.stringify(sketchCategoryList))
}
make();

async function getExamplesCategories(){
  try{
    requestOptions.url =  `https://api.github.com/repos/ml5js/ml5-examples/contents${branchRef}`
      
    const results = await rp(requestOptions)
    // get the p5js and javascript directories
    const sketchRootList = results.filter( (metadata) => metadata.name == 'p5js' || metadata.name === 'javascript')
    
    return sketchRootList;
  } catch(err){
    return err;
  }
}

async function getCategoryDirectories(sketchRootList){
  const sketchRootCategories = sketchRootList.map( async (categories) => {
    requestOptions.url =  `https://api.github.com/repos/ml5js/ml5-examples/contents/${categories.path}${branchRef}`
    
    const sketchDirs = await rp(requestOptions);
    const result = flatten(sketchDirs)

    return result
  })

  const sketchList = await Q.all(sketchRootCategories)
  
  let output = [];
  sketchList.forEach( (list) => {
    list.forEach(item => {
      if(item.type === 'dir'){
        output.push(item)
      }
    })
  })

  return output;
}

async function appendSketchItemLinks(sketchCategoryList){
  const sketchList = sketchCategoryList.map( async (sketches) => {
    requestOptions.url =  `https://api.github.com/repos/ml5js/ml5-examples/contents/${sketches.path}${branchRef}`
    
    const sketchItems = await rp(requestOptions);
    sketches.tree = sketchItems

    return sketches;
  })

  const output = await Q.all(sketchList)
  return output
}


// 4. for each sketch item
// function getSketchItems(sketchList) {
//   // const completeSketchPkg = [];

//   /* eslint-disable */
//   return Q.all(sketchList[0].map(sketch => Q.all(sketch.tree.map((item) => {
//     if (item.name === 'data') {
//       const options = {
//         url: `https://api.github.com/repos/generative-design/Code-Package-p5.js/contents/${item.path}${branchRef}`,
//         qs: {
//           client_id: clientId,
//           client_secret: clientSecret
//         },
//         method: 'GET',
//         headers,
//         json: true
//       };

//       return rp(options).then((res) => {
//         sketch.data = res;
//         return sketch;
//       }).catch((err) => {
//         throw err;
//       });
//     }
//     // pass
//   })))).then(() => sketchList[0]);
//   /* eslint-enable */
// }