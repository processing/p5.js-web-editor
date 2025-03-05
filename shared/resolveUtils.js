// Neessary imports required for the Function.
import { resolvePathToFile } from '../server/utils/filePath';
import { MEDIA_FILE_REGEX } from '../server/utils/fileUtils';

// Shared function to resolve paths for elements with a specific attribute
export default function resolvePathsForElementsWithAttribute(
  attr,
  sketchDoc,
  files
) {
  const elements = sketchDoc.querySelectorAll(`[${attr}]`);
  const elementsArray = Array.prototype.slice.call(elements);
  elementsArray.forEach((element) => {
    // Use RegExp.test() instead of match() !== null
    if (MEDIA_FILE_REGEX.test(element.getAttribute(attr))) {
      const resolvedFile = resolvePathToFile(element.getAttribute(attr), files);
      if (resolvedFile && resolvedFile.url) {
        element.setAttribute(attr, resolvedFile.url);
      }
    }
  });
}
