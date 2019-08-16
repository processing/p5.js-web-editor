/* eslint-disable */
export function insertLibrary(htmlContent, url) {
  const parser = new DOMParser();
  const sketchDoc = parser.parseFromString(htmlContent, 'text/html');

  const library = sketchDoc.createElement('script');
  library.src = url;

  sketchDoc.head.appendChild(library);

  return `<!DOCTYPE HTML>\n${sketchDoc.documentElement.outerHTML}`;
}
