import { resolvePathToFile } from './filePath';
import { MEDIA_FILE_REGEX } from './fileUtils';

/**
 * Resolves paths for elements with a specific attribute.
 *
 * @param {string} attr - The attribute name to search for in elements, such as "src" or "href".
 * @param {Document} sketchDoc - The document to search for elements with the attribute.
 * @param {Array} files - The files to search for the resolved paths.
 */

export default function resolvePathsForElementsWithAttribute(
  attr,
  sketchDoc,
  files
) {
  const elements = sketchDoc.querySelectorAll(`[${attr}]`);

  const elementsArray = Array.prototype.slice.call(elements);

  elementsArray.forEach((element) => {
    const attrValue = element.getAttribute(attr);

    if (MEDIA_FILE_REGEX.test(attrValue)) {
      const resolvedFile = resolvePathToFile(attrValue, files);

      if (resolvedFile && resolvedFile.url) {
        element.setAttribute(attr, resolvedFile.url);
      }
    }
  });
}
