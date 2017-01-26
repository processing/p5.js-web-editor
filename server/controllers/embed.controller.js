import jsdom, { serializeDocument } from 'jsdom';
import Project from '../models/project';
import {
  injectMediaUrls,
  resolvePathsForElementsWithAttribute,
  resolveScripts,
  resolveStyles } from '../utils/previewGeneration';

export function serveProject(req, res) {
  Project.findById(req.params.project_id)
    .exec((err, project) => {
      // TODO this does not parse html
      const files = project.files;
      const htmlFile = files.find(file => file.name.match(/\.html$/i)).content;
      const filesToInject = files.filter(file => file.name.match(/\.(js|css)$/i));
      injectMediaUrls(filesToInject, files, req.params.project_id);

      jsdom.env(htmlFile, (innerErr, window) => {
        const sketchDoc = window.document;

        const base = sketchDoc.createElement('base');
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        base.href = `${fullUrl}/`;
        sketchDoc.head.appendChild(base);

        resolvePathsForElementsWithAttribute('src', sketchDoc, files);
        resolvePathsForElementsWithAttribute('href', sketchDoc, files);
        resolveScripts(sketchDoc, files);
        resolveStyles(sketchDoc, files);

        res.send(serializeDocument(sketchDoc));
      });
    });
}

export default serveProject;
