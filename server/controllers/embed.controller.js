import Project from '../models/project';
import escapeStringRegexp from 'escape-string-regexp';
const startTag = '@fs-';

function injectMediaUrls(filesToInject, mediaFiles, textFiles, projectId) {
  filesToInject.forEach(file => {
    let fileStrings = file.content.match(/(['"])((\\\1|.)*?)\1/gm);
    const fileStringRegex = /^('|")(?!(http:\/\/|https:\/\/)).*('|")$/i;
    fileStrings = fileStrings || [];
    fileStrings.forEach(fileString => {
      //if string does not begin with http or https
      if (fileString.match(fileStringRegex)) {
        const filePath = fileString.substr(1, fileString.length - 2);
        const filePathArray = filePath.split('/');
        const fileName = filePathArray[filePathArray.length - 1];
        mediaFiles.forEach(mediaFile => {
          if (mediaFile.name === fileName) {
            file.content = file.content.replace(filePath, mediaFile.url);
          }
        });
        if (textFiles) {
          textFiles.forEach(textFile => {
            if (textFile.name === fileName) {
              file.content = file.content.replace(filePath, `/api/projects/${projectId}/${textFile.name}`);
            }
          });
        }
      }
    });
  });
}

export function serveProject(req, res) {
  Project.findById(req.params.project_id)
    .exec((err, project) => {
      const files = project.files;
      let htmlFile = files.find(file => file.name.match(/\.html$/i)).content;
      const jsFiles = files.filter(file => file.name.match(/\.js$/i));
      const cssFiles = files.filter(file => file.name.match(/\.css$/i));
      const mediaFiles = files.filter(file => file.url);
      const textFiles = files.filter(file => file.name.match(/(.+\.json$|.+\.txt$|.+\.csv$)/i) && file.url === undefined);

      injectMediaUrls(jsFiles, mediaFiles, textFiles, req.params.project_id);
      injectMediaUrls(cssFiles, mediaFiles);

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