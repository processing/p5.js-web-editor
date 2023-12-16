import JSZip from 'jszip';
import format from 'date-fns/format';
import isUrl from 'is-url';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';
import { addFileToZip } from '../project.controller';
import Collection from '../../models/collection';
import generateFileSystemSafeName from '../../utils/generateFileSystemSafeName';

function formatCollection(collection) {
  const { items, name, owner } = collection;
  const folder = {
    name: 'root',
    fileType: 'folder',
    children: []
  };

  const formattedCollection = {
    name,
    owner: owner.username,
    files: [folder]
  };

  items.forEach((item) => {
    const { project } = item;
    const rootFile = project.files.find((file) => file.name === 'root');
    rootFile.name = project.name;
    formattedCollection.files.push(...project.files);
    folder.children.push(rootFile.id);
  });

  return formattedCollection;
}

function bundleExternalLibsForCollection(collection) {
  const { files } = collection;
  const htmlFiles = [];
  const projectFolders = [];
  files.forEach((file) => {
    if (file.name === 'index.html') htmlFiles.push(file);
    else if (file.fileType === 'folder' && file.name !== 'root')
      projectFolders.push(file);
  });
  htmlFiles.forEach((indexHtml) => {
    const { window } = new JSDOM(indexHtml.content);
    const scriptTags = window.document.getElementsByTagName('script');

    const parentFolder = projectFolders.filter((folder) =>
      folder.children.includes(indexHtml.id)
    );

    Object.values(scriptTags).forEach(async ({ src }, i) => {
      if (!isUrl(src)) return;

      const path = src.split('/');
      const filename = path[path.length - 1];
      const libId = `${filename}-${parentFolder[0].name}`;

      collection.files.push({
        name: filename,
        url: src,
        id: libId
      });

      parentFolder[0].children.push(libId);
    });
  });
}

async function buildCollectionZip(collection, req, res) {
  try {
    const zip = new JSZip();
    const currentTime = format(new Date(), 'yyyy_MM_dd_HH_mm_ss');
    collection.slug = slugify(`${collection.name} by ${collection.owner}`, '_');
    const zipFileName = `${generateFileSystemSafeName(
      collection.slug
    )}_${currentTime}.zip`;
    const { files } = collection;
    const root = files.find((file) => file.name === 'root');

    bundleExternalLibsForCollection(collection);
    await addFileToZip(root, files, zip);

    const base64 = await zip.generateAsync({ type: 'base64' });
    const buff = Buffer.from(base64, 'base64');
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': `attachment; filename=${zipFileName}`
    });
    res.end(buff);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
}

export default async function downloadCollection(req, res) {
  const { id } = req.params;
  const collection = await Collection.findById(id)
    .populate('items.project')
    .populate('owner');
  const formattedCollection = formatCollection(collection);
  buildCollectionZip(formattedCollection, req, res);
}
