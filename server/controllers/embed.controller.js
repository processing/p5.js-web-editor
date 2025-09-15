import jsdom, { serializeDocument } from 'jsdom';
import Project from '../models/project';
import {
  injectMediaUrls,
  resolvePathsForElementsWithAttribute,
  resolveScripts,
  resolveStyles
} from '../utils/previewGeneration';
import { get404Sketch } from '../views/404Page';

export function serveProject(req, res) {
  const projectId = req.params.project_id;

  Project.findOne({ $or: [{ _id: projectId }, { slug: projectId }] })
    .then((project) => {
      if (!project) {
        get404Sketch((html) => res.send(html));
        return;
      }

      const { files } = project;
      const htmlFile = files.find((file) => file.name.match(/\.html$/i))
        ?.content;

      if (!htmlFile) {
        get404Sketch((html) => res.send(html));
        return;
      }

      const filesToInject = files.filter((file) =>
        file.name.match(/\.(js|css)$/i)
      );

      injectMediaUrls(filesToInject, files, req.params.project_id);

      jsdom.env(htmlFile, (innerErr, window) => {
        if (innerErr) {
          res.status(500).send('Error rendering project');
          return;
        }

        const sketchDoc = window.document;

        const base = sketchDoc.createElement('base');
        const fullUrl = `//${req.get('host')}${req.originalUrl}`;
        base.href = `${fullUrl}/`;
        sketchDoc.head.appendChild(base);

        resolvePathsForElementsWithAttribute('src', sketchDoc, files);
        resolvePathsForElementsWithAttribute('href', sketchDoc, files);
        resolveScripts(sketchDoc, files);
        resolveStyles(sketchDoc, files);

        res.setHeader('Cache-Control', 'public, max-age=0');
        res.send(serializeDocument(sketchDoc));
      });
    })
    .catch((err) => {
      console.error(err);
      get404Sketch((html) => res.send(html));
    });
}

export default serveProject;
