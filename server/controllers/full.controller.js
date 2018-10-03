import jsdom, { serializeDocument } from 'jsdom';
import Project from '../models/project';
import {
  injectMediaUrls,
  resolvePathsForElementsWithAttribute,
  resolveScripts,
  resolveStyles } from '../utils/previewGeneration';
import { get404Sketch } from '../views/404Page';

export function serveProject(req, res) {
  Project.findById(req.params.project_id)
    .exec((err, project) => {
      if (err || !project) {
        get404Sketch(html => res.send(html));
        return;
      }
      const { files } = project;
      const htmlFile = files.find(file => file.name.match(/\.html$/i)).content;
      const filesToInject = files.filter(file => file.name.match(/\.(js|css)$/i));
      injectMediaUrls(filesToInject, files, req.params.project_id);

      jsdom.env(htmlFile, (innerErr, window) => {
        const sketchDoc = window.document;

        const base = sketchDoc.createElement('base');
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        base.href = `${fullUrl}/`;
        sketchDoc.head.appendChild(base);

        // Creating the header
        const h1 = sketchDoc.createElement('h1');
        h1.innerHTML = project.name;
        sketchDoc.body.appendChild(h1);
        const h2 = sketchDoc.createElement('h2');
        h2.innerHTML = `Author: ${req.params.username}`;
        sketchDoc.body.appendChild(h2);
        const a = sketchDoc.createElement('a');
        const sketchUrl = `${req.protocol}://${req.get('host')}/${req.params.username}/sketches/${req.params.project_id}`;
        a.innerHTML = 'See in editor<br/>'; a.href = sketchUrl;
        sketchDoc.body.appendChild(a);

        resolvePathsForElementsWithAttribute('src', sketchDoc, files);
        resolvePathsForElementsWithAttribute('href', sketchDoc, files);
        resolveScripts(sketchDoc, files);
        resolveStyles(sketchDoc, files);

        res.send(serializeDocument(sketchDoc));
      });
    });
}

export default serveProject;
