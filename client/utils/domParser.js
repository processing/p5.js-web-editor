/* eslint-disable */
// i can get rid of this when this file exports multiple functions
import beautifyJS from 'js-beautify';

export function insertLibrary(htmlContent, url) {
  const parser = new DOMParser();
  const sketchDoc = parser.parseFromString(htmlContent, 'text/html');

  const library = sketchDoc.createElement('script');
  library.src = url;

  sketchDoc.head.appendChild(library);

  return beautifyJS.html(`<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`);
}
