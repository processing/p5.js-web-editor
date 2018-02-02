import rp from 'request-promise';
import Q from 'q';
import mongoose from 'mongoose';
import objectID from 'bson-objectid';
import shortid from 'shortid';
import eachSeries from 'async/eachSeries';
import User from './models/user';
import Project from './models/project';

// TEMP: serve the gg-dep-bundle.js from rawgit cdn
// https://cdn.rawgit.com/generative-design/Code-Package-p5.js/pre-release/libraries/gg-dep-bundle/gg-dep-bundle.js

// TEMP: GATHER DATA FROM STATIC FILE
// - to save time use local json file for now -
const fs = require('fs');

// gg-github-retrieval.json
// gg-github-newProjects.json
function retrieveDataTemp(fName) {
  return new Promise((resolve, reject) => {
    let ggdata = __dirname + "/" + fName;
    resolve(JSON.parse(fs.readFileSync(ggdata)));

  })
}




const defaultHTML =
  `<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.11/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.11/addons/p5.dom.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.11/addons/p5.sound.min.js"></script>

    <!-- Generative Design Dependencies here -->
    <!-- GG Bundled -->
    <script src="https://rawgit.com/generative-design/Code-Package-p5.js/pre-release/libraries/gg-dep-bundle/gg-dep-bundle.js"></script>

    <!-- Opentype -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/opentype.js/0.7.3/opentype.min.js"></script>
    <!-- Rita -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/rita/1.3.11/rita-small.min.js"></script>
    <!-- Chroma -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/1.3.6/chroma.min.js"></script>

    <!-- sketch additions -->


    <link rel="stylesheet" type="text/css" href="style.css">
  </head>
  <body>

    <!-- main -->
    <script src="sketch.js"></script>
  </body>
</html>
`;

const defaultCSS =
  `html, body {
  padding: 0;
  margin: 0;
}

canvas {
  vertical-align: top;
}
`;

const branchName = 'gg4editor';
const branchRef = `?ref=${branchName}`;
const clientId = process.env.GITHUB_ID;
const clientSecret = process.env.GITHUB_SECRET;

const headers = { 'User-Agent': 'p5js-web-editor/0.0.1' };

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


// 1. first get the top level directories P and M
// https://api.github.com/repos/generative-design/Code-Package-p5.js/contents?ref=pre-release
function getCodePackage() {
  const sketchRootList = [];
  const options = {
    // url: 'https://api.github.com/repos/generative-design/Code-Package-p5.js/contents',
    url: `https://api.github.com/repos/generative-design/Code-Package-p5.js/contents${branchRef}`,
    // url: 'https://api.github.com/repos/generative-design/Code-Package-p5.js/contents?ref=pre-release',
    qs: {
      client_id: clientId,
      client_secret: clientSecret
    },
    method: 'GET',
    headers
  };

  return rp(options).then((res) => {
    const json = JSON.parse(res);

    json.forEach((metadata) => {
      if (metadata.name.endsWith("P") === true | metadata.name.endsWith("M") === true) {
        sketchRootList.push(metadata);
      }
    })

    return sketchRootList;
  }).catch((err) => {
    throw err;
  });

}

// 2. get the list of all the top-level sketch directories in P and M
function getSketchDirectories(sketchRootList) {
  // console.log(sketchRootList);

  return Q.all(sketchRootList.map((sketches) => {
      // console.log(sketches)

      const options = {
        url: `https://api.github.com/repos/generative-design/Code-Package-p5.js/contents/${sketches.path}${branchRef}`,
        qs: {
          client_id: clientId,
          client_secret: clientSecret
        },
        method: 'GET',
        headers
      }


      return rp(options).then((res) => {
        let sketchDirs = flatten(JSON.parse(res));

        return sketchDirs;
      }).catch((err) => {
        throw err;
      });

    })

  ).then((output) => {
    const sketchList = [];
    output.forEach((l) => {
      l.forEach((i) => {
        if (i.type == "dir")
          sketchList.push(i);
      })
    })

    return sketchList;
  })

}

var flatten = function flatten(list) {
  return list.reduce(function(a, b) {
    return a.concat(Array.isArray(b) ? flatten(b) : b);
  }, []);
};

// 3. For each sketch item in the sketchList, append the tree contents to each item
function appendSketchItemLinks(sketchList) {

  return Q.all(sketchList.map((sketches) => {
    const options = {
      // url: `${sketches.url}?client_id=${clientId}&client_secret=${clientSecret}`,
      url: `https://api.github.com/repos/generative-design/Code-Package-p5.js/contents/${sketches.path}${branchRef}`,
      qs: {
        client_id: clientId,
        client_secret: clientSecret
      },
      method: 'GET',
      headers
    }

    return rp(options).then((res) => {
      const sketchItems = JSON.parse(res);
      sketches.tree = sketchItems;

      return sketchList;
    })

  }))

}

// 4. for each sketch item 
function getSketchItems(sketchList) {

  const completeSketchPkg = [];

  return Q.all(sketchList[0].map(sketch => Q.all(sketch.tree.map((item) => {
    if (item.name == "data") {
      // console.log(item.path);

      const options = {
        url: `https://api.github.com/repos/generative-design/Code-Package-p5.js/contents/${item.path}${branchRef}`,
        qs: {
          client_id: clientId,
          client_secret: clientSecret
        },
        method: 'GET',
        headers
      }

      return rp(options).then((res) => {
        sketch.data = JSON.parse(res);
        return sketch;
      }).catch((err) => {
        throw err
      })

    } else {
      // pass
    }

  })))).then(() => {
    return sketchList[0]
  })

}

const insert = function insert(main_string, ins_string, pos) {
  if (typeof(pos) == "undefined") {
    pos = 0;
  }
  if (typeof(ins_string) == "undefined") {
    ins_string = '';
  }
  return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
}

function formatSketchForStorage(sketch, user) {
  // create a new project template
  let newProject;
  const a = objectID().toHexString();
  const b = objectID().toHexString();
  const c = objectID().toHexString();
  const r = objectID().toHexString();

  newProject = new Project({
    name: sketch.name,
    user: user._id,
    files: [{
        name: 'root',
        id: r,
        _id: r,
        children: [a, b, c],
        fileType: 'folder'
      },
      {
        name: 'sketch.js',
        content: getSketchDownloadUrl(sketch),
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

  // get the sketch download url
  function getSketchDownloadUrl(sketch) {
    let downloadUrl = '';
    sketch.tree.forEach((item) => {
      if (item.name == "sketch.js") {
        downloadUrl = downloadUrl + item.download_url;
      }
    })
    return downloadUrl;
  }

  // get any additional js files url
  // TODO: this could probably be optimized - so many loops!
  function addAdditionalJs(sketch, newProjectObject) {
    let output = newProjectObject.files;

    sketch.tree.forEach((item) => {
      if (item.name.endsWith(".js") == true && item.name !== "sketch.js") {
        const itemId = objectID().toHexString();

        let projectItem = {
          name: item.name,
          content: item.download_url,
          id: itemId,
          _id: itemId,
          fileType: 'file',
          children: []
        }

        // push the projectItem to the files array
        output.push(projectItem);
        // add the ID to the root children id array
        output[0].children.push(projectItem.id);
        //  add the JS reference to the defaultHTML
        output[2].content = insert(output[2].content, `<script src='${item.name}'></script>`, output[2].content.search("<!-- sketch additions -->"));
      }
    })

    // if there's output return it, if not pass
    if (output.length > 0) {
      return output;
    } else {
      console.log("ERR with addAdditionalJs!")
      return null
    }
  }
  newProject.files = addAdditionalJs(sketch, newProject);

  // fill the data folder with the data files for each sketch
  function fillDataFolder(sketch, newProjectObject) {
    const dataInProject = sketch.data || [];
    let output = newProjectObject.files

    // create a data folder if there are data in the project
    if (dataInProject.length > 0) {
      const objId = objectID().toHexString();

      let dataFolderIndex = output.length
      output.push({
        name: 'data',
        id: objId,
        _id: objId,
        children: [],
        fileType: 'folder'
      });
      // add assets folder inside root
      output[0].children.push(objId);

      // for all the data, stuff them into the folder
      dataInProject.forEach((item) => {
        const fileID = objectID().toHexString();
        output.push({
          name: item.name,
          content: item.download_url,
          id: fileID,
          _id: fileID,
          children: [],
          fileType: 'file'
        });
        // console.log(`create data: ${item.name}`);
        // add asset file inside the newly created assets folder at last position
        output[dataFolderIndex].children.push(fileID);
      })
    }
    return output;
  }
  newProject.files = fillDataFolder(sketch, newProject);

  // return the newProject
  // console.log(newProject);
  return newProject

}

// format all the sketches using the formatSketchForStorage()
function formatAllSketches(sketchList) {
  return new Promise((resolve, reject) => {
    User.findOne({ username: 'generative-design' }, (err, user) => {
      let output = [];
      sketchList.forEach((sketch) => {
        let newProject = formatSketchForStorage(sketch, user);
        output.push(newProject);
      })
      resolve(output);
    })

  })
}


// get all the sketch data content and download to the newProjects array
function getAllSketchContent(newProjectList) {

  return Q.all(newProjectList.map(newProject => Q.all(newProject.files.map((sketchFile, i) => {

    /*
      sketchFile.name.endsWith(".mov") !== true &&
      sketchFile.name.endsWith(".otf") !== true &&
      sketchFile.name.endsWith(".ttf") !== true &&
    */

    if (sketchFile.fileType == 'file' &&
      sketchFile.content != null &&
      sketchFile.name.endsWith(".html") !== true &&
      sketchFile.name.endsWith(".css") !== true &&
      sketchFile.name.endsWith(".mp4") !== true &&
      sketchFile.name.endsWith(".ogg") !== true &&
      sketchFile.name.endsWith(".otf") !== true && sketchFile.name.endsWith(".ttf") !== true
    ) {

      const options = {
        url: newProject.files[i].content,
        qs: {
          client_id: clientId,
          client_secret: clientSecret
        },
        method: 'GET',
        headers
      };

      // console.log("CONVERT ME!")
      return rp(options).then((res) => {
        newProject.files[i].content = res;
        return newProject
      }).catch((err) => {
        throw err
      })

    }

  })).catch((err) => {
    throw err
  }))).then(() => {

    return newProjectList;
  })

}

function linkToFontFiles(newProjectList){
  return Q.all(newProjectList.map(newProject => Q.all(newProject.files.map((sketchFile, i) => {

    if( sketchFile.fileType == 'file' &&
      sketchFile.content != null &&
      sketchFile.name.endsWith(".otf") == true || sketchFile.name.endsWith(".ttf") == true ){
      // handle cases for fonts
      // create a rawgit cdn ==> replace ref in sketch.js with link to cdn
      console.log(sketchFile.name);
      // https://cdn.rawgit.com/opensourcedesign/fonts/2f220059/gnu-freefont_freesans/FreeSans.otf?raw=true
      // "https://raw.githubusercontent.com/generative-design/Code-Package-p5.js/gg4editor/01_P/P_3_2_1_01/data/FreeSans.otf",
      const rawGitRef = `https://cdn.rawgit.com/${newProject.files[i].content.split(".com/")[1]}`;
      sketchFile.content = rawGitRef;

      // replace ref in sketch.js
      newProject.files[1].content = newProject.files[1].content.replace(`'data/${sketchFile.name}'`, `'${rawGitRef}'`);      
      // console.log(newProject.files[1].content)
      return newProject;
    } 

  })).catch((err) => {
    throw err
  }))).then(() => {

    return newProjectList;
  })
}


// Save the project in the db
function createProjectsInP5user(newProjectList) {
  User.findOne({ username: 'generative-design' }, (err, user) => {
    if (err) throw err;

    eachSeries(newProjectList, (newProject, sketchCallback) => {

      newProject.save((saveErr, savedProject) => {
        if (saveErr) throw saveErr;
        console.log(`Created a new project in p5 user: ${savedProject.name}`);
        sketchCallback();
      });
    })
  }).catch((err) => {
    throw err;
  });
}

// remove any of the old files and add the new stuffs to the UI
function getp5User() {

  User.findOne({ username: 'generative-design' }, (err, user) => {
    if (err) throw err;

    let ggUser = user;
    if (!ggUser) {
      ggUser = new User({
        username: process.env.GG_EXAMPLES_USERNAME,
        email: process.env.GG_EXAMPLES_PASS,
        password: process.env.GG_EXAMPLES_EMAIL
      });
      ggUser.save((saveErr) => {
        if (saveErr) throw saveErr;
        console.log(`Created a user p5${ggUser}`);
      });
    }

    Project.find({ user: ggUser._id }, (projectsErr, projects) => {
      // if there are already some sketches, delete them
      console.log('Deleting old projects...');
      projects.forEach((project) => {
        Project.remove({ _id: project._id }, (removeErr) => {
          if (removeErr) throw removeErr;
        });
      });


    });


    // Run for production
    // return getCodePackage()
    //   .then(getSketchDirectories)
    //   .then(appendSketchItemLinks)
    //   .then(getSketchItems)
    //   .then(formatAllSketches)
    //   .then(getAllSketchContent)
    //   .then(createProjectsInP5user)

    // Run for Testing
    // return retrieveDataTemp()
    //   .then(formatAllSketches)
    //   .then(getAllSketchContent)
    //   .then(saveToFile)
    //   .then(createProjectsInP5user)

    return retrieveDataTemp('gg-github-retrieval.json')
      .then(formatAllSketches)
      .then(getAllSketchContent)
      .then(linkToFontFiles)
      // .then(saveToFile)
      .then(createProjectsInP5user)
      // .then(doNext);

  })

}
// Run the entire process
getp5User();



/*** Tester Functions - IGNORE BELOW
@ below are functions for testing
output etc
***/
// formatSketchForStorage(P_2_1_1_04);
// formatSketchForStorage(M_1_5_04);

// checking function 
function doNext(output) {
  console.log( JSON.stringify(output));
  console.log(output.length);
}

// save output to terminal
function saveToFile(output) {
  // console.log(JSON.stringify(output))
  // console.log(output.length)

  fs.writeFileSync(`server/gg-github-newProjects.json`, JSON.stringify(output));
}
// test make without deleting all projects etc
function make() {
  console.log("doing the thing!")

  // return getCodePackage()
  //   .then(getSketchDirectories)
  //   .then(appendSketchItemLinks)
  //   .then(getSketchItems)
  //   .then(saveToFile)
  // .then(doNext);

  // return retrieveDataTemp('gg-github-newProjects.json')
    // .then(formatAllSketches)
    // .then(getAllSketchContent)
  // .then(saveToFile)
  // .then(createProjectsInP5user)
  // .then(doNext);

  return retrieveDataTemp('gg-github-retrieval.json')
    .then(formatAllSketches)
    .then(getAllSketchContent)
    .then(linkToFontFiles)
    .then(saveToFile)
}
// make();