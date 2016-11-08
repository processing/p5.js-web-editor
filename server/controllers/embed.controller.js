import Project from '../models/project';
import escapeStringRegexp from 'escape-string-regexp';
const startTag = '@fs-';
import { resolvePathToFile } from '../utils/filePath';

function injectMediaUrls(filesToInject, allFiles, projectId) {
  filesToInject.forEach(file => {
    let fileStrings = file.content.match(/(['"])((\\\1|.)*?)\1/gm);
    const fileStringRegex = /^('|")(?!(http:\/\/|https:\/\/)).*('|")$/i;
    fileStrings = fileStrings || [];
    fileStrings.forEach(fileString => {
      //if string does not begin with http or https
      if (fileString.match(fileStringRegex)) {
        const filePath = fileString.substr(1, fileString.length - 2);
        const resolvedFile = resolvePathToFile(filePath, allFiles);
        if (resolvedFile) {
          if (resolvedFile.url) {
            file.content = file.content.replace(filePath,resolvedFile.url);
          } else if (resolvedFile.name.match(/(.+\.json$|.+\.txt$|.+\.csv$)/i)) {
            let resolvedFilePath = filePath;
            if (resolvedFilePath.startsWith('.')) {
              resolvedFilePath = resolvedFilePath.substr(1);
            }
            while (resolvedFilePath.startsWith('/')) {
              resolvedFilePath = resolvedFilePath.substr(1);
            }
            file.content = file.content.replace(filePath, `/api/projects/${projectId}/${resolvedFilePath}`);
          }
        }
      }
    });
  });
}

export function serveProject(req, res) {
  Project.findById(req.params.project_id)
    .exec((err, project) => {
      //TODO this does not parse html
      const files = project.files;
      let htmlFile = files.find(file => file.name.match(/\.html$/i)).content;
      const jsFiles = files.filter(file => file.name.match(/\.js$/i));
      const cssFiles = files.filter(file => file.name.match(/\.css$/i));

      injectMediaUrls(jsFiles, files, req.params.project_id);
      injectMediaUrls(cssFiles, files, req.params.project_id);

      jsFiles.forEach(jsFile => {
        const fileName = escapeStringRegexp(jsFile.name);
        const fileRegex = new RegExp(`<script.*?src=('|")((\.\/)|\/)?${fileName}('|").*?>([\s\S]*?)<\/script>`, 'gmi');
        const replacementString = `<script data-tag="${startTag}${jsFile.name}">\n${jsFile.content}\n</script>`;
        htmlFile = htmlFile.replace(fileRegex, replacementString);
      });

      cssFiles.forEach(cssFile => {
        const fileName = escapeStringRegexp(cssFile.name);
        const fileRegex = new RegExp(`<link.*?href=('|")((\.\/)|\/)?${fileName}('|").*?>`, 'gmi');
        htmlFile = htmlFile.replace(fileRegex, `<style>\n${cssFile.content}\n</style>`);
      });

      res.send(htmlFile);
    });
}