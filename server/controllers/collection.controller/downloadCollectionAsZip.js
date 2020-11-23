import archiver from 'archiver';
import format from 'date-fns/format';
import isUrl from 'is-url';
import jsdom, { serializeDocument } from 'jsdom';
import request from 'request';
import slugify from 'slugify';

import generateFileSystemSafeName from '../../utils/generateFileSystemSafeName';
import Collection from '../../models/collection';
import User from '../../models/user';


async function getOwnerUserId(req) {
  if (req.params.username) {
    const user =
      await User.findByUsername(req.params.username);
    if (user && user._id) {
      return user._id;
    }
  } else if (req.user._id) {
    return req.user._id;
  }

  return null;
}

function bundleExternalLibs(project, projectFolderName, zip, callback) {
  const indexHtml = project.files.find(file => file.name.match(/\.html$/));
  let numScriptsResolved = 0;
  let numScriptTags = 0;

  function resolveScriptTagSrc(scriptTag, document) {
    const path = scriptTag.src.split('/');
    const filename = path[path.length - 1];
    const { src } = scriptTag;

    if (!isUrl(src)) {
      numScriptsResolved += 1;
      if (numScriptsResolved === numScriptTags) {
        indexHtml.content = serializeDocument(document);
        callback();
      }
      return;
    }

    request({ method: 'GET', url: src, encoding: null }, (err, response, body) => {
      if (err) {
        console.log(err);
      } else {
        zip.append(body, { name: `/${projectFolderName}/${filename}` });
        scriptTag.src = filename;
      }

      numScriptsResolved += 1;
      if (numScriptsResolved === numScriptTags) {
        indexHtml.content = serializeDocument(document);
        callback();
      }
    });
  }

  jsdom.env(indexHtml.content, (innerErr, window) => {
    const indexHtmlDoc = window.document;
    const scriptTags = indexHtmlDoc.getElementsByTagName('script');
    numScriptTags = scriptTags.length;
    for (let i = 0; i < numScriptTags; i += 1) {
      resolveScriptTagSrc(scriptTags[i], indexHtmlDoc);
    }
    if (numScriptTags === 0) {
      indexHtml.content = serializeDocument(document);
      callback();
    }
  });
}

function buildZip(project, zip, callback) {
  const rootFile = project.files.find(file => file.name === 'root');
  const numFiles = project.files.filter(file => file.fileType !== 'folder').length;
  const { files } = project;
  let numCompletedFiles = 0;

  const currentTime = format(new Date(), 'yyyy_MM_dd_HH_mm_ss');
  project.slug = slugify(project.name, '_');
  const projectFolderName = `${generateFileSystemSafeName(project.slug)}_${currentTime}`;


  function addFileToZip(file, path) {
    if (file.fileType === 'folder') {
      const newPath = file.name === 'root' ? path : `${path}${file.name}/`;
      file.children.forEach((fileId) => {
        const childFile = files.find(f => f.id === fileId);
        (() => {
          addFileToZip(childFile, newPath);
        })();
      });
    } else if (file.url) {
      request({ method: 'GET', url: file.url, encoding: null }, (err, response, body) => {
        zip.append(body, { name: `${path}${file.name}` });
        numCompletedFiles += 1;
        if (numCompletedFiles === numFiles) {
          callback();
        }
      });
    } else {
      zip.append(file.content, { name: `${path}${file.name}` });
      numCompletedFiles += 1;
      if (numCompletedFiles === numFiles) {
        callback();
      }
    }
  }

  bundleExternalLibs(project, projectFolderName, zip, () => {
    addFileToZip(rootFile, `/${projectFolderName}/`);
  });
}

export default function downloadCollectionAsZip(req, res) {
  function sendFailure({ code = 500, message = 'Something went wrong' }) {
    res.status(code).json({ success: false, message });
  }

  function findCollection(owner) {
    if (owner == null) {
      sendFailure({ code: 404, message: 'User not found' });
    }

    return Collection
      .findById(req.params.id)
      .populate({ path: 'items.project' })
      .then((collection) => {
        if (collection.owner.toString() === owner.toString()) {
          return collection;
        }
        return sendFailure({ code: 403, message: 'Not Authorized' });
      });
  }

  function buildCollectionZip(collection) {
    if (collection.items.length === 0) {
      sendFailure({ code: 500, message: 'Collection is empty' });
      return;
    }

    const zip = archiver('zip');
    zip.on('error', (err) => {
      console.log(err);
      res.status(500).send({ error: err.message });
    });

    const currentTime = format(new Date(), 'yyyy_MM_dd_HH_mm_ss');
    res.attachment(`${generateFileSystemSafeName(collection.slug)}_${currentTime}.zip`);
    zip.pipe(res);

    let count = 0;
    function checkCount() {
      count += 1;
      if (count === collection.items.length) {
        zip.finalize();
      }
    }

    for (let i = 0; i < collection.items.length; i += 1) {
      const { project } = collection.items[i];
      buildZip(project, zip, checkCount);
    }
  }

  return getOwnerUserId(req)
    .then(findCollection)
    .then(buildCollectionZip)
    .catch(sendFailure);
}
