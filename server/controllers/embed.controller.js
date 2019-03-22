import jsdom, { serializeDocument } from 'jsdom';
import Project from '../models/project';
import {
  injectMediaUrls,
  resolvePathsForElementsWithAttribute,
  resolveScripts,
  resolveStyles
} from '../utils/previewGeneration';
import { get404Sketch } from '../views/404Page';

export async function serveProject(req, res) {
  try {
    const project = await Project.findById(req.params.project_id);
    if (!project) {
      get404Sketch(html => res.send(html));
      return;
    }
    // TODO this does not parse html
    const { files } = project;
    const htmlFile = files.find(file => file.name.match(/\.html$/i)).content;
    const filesToInject = files.filter(file => file.name.match(/\.(js|css)$/i));
    injectMediaUrls(filesToInject, files, req.params.project_id);

    jsdom.env(htmlFile, (innerErr, window) => {
      const sketchDoc = window.document;

      const base = sketchDoc.createElement('base');
      const fullUrl = `https://${req.get('host')}${req.originalUrl}`;
      base.href = `${fullUrl}/`;
      sketchDoc.head.appendChild(base);

      resolvePathsForElementsWithAttribute('src', sketchDoc, files);
      resolvePathsForElementsWithAttribute('href', sketchDoc, files);
      resolveScripts(sketchDoc, files);
      resolveStyles(sketchDoc, files);

      res.send(serializeDocument(sketchDoc));
    });
  } catch (err) {
    get404Sketch(html => res.send(html));
    return;
  }
}

export default serveProject;
