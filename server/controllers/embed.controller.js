import Project from '../models/project';
import escapeStringRegexp from 'escape-string-regexp';
const startTag = '@fs-';
import { resolvePathToFile } from '../utils/filePath';
import {
  injectMediaUrls,
  resolvePathsForElementsWithAttribute,
  resolveScripts,
  resolveStyles } from '../utils/previewGeneration';
import jsdom, { serializeDocument } from 'jsdom';

export function serveProject(req, res) {
  Project.findById(req.params.project_id)
    .exec((err, project) => {
      //TODO this does not parse html
      const files = project.files;
      let htmlFile = files.find(file => file.name.match(/\.html$/i)).content;
      const filesToInject = files.filter(file => file.name.match(/\.(js|css)$/i));
      injectMediaUrls(filesToInject, files, req.params.project_id);

      jsdom.env(htmlFile, (err, window) => {
        const sketchDoc = window.document;
        resolvePathsForElementsWithAttribute('src', sketchDoc, files);
        resolvePathsForElementsWithAttribute('href', sketchDoc, files);
        resolveScripts(sketchDoc, files);
        resolveStyles(sketchDoc, files);

        res.send(serializeDocument(sketchDoc));
      });
    });
}