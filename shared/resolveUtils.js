// Import necessary utilities for resolving file paths and checking media file patterns
import { resolvePathToFile } from '../server/utils/filePath'; // Utility to resolve file paths
import { MEDIA_FILE_REGEX } from '../server/utils/fileUtils'; // Regex pattern to identify media files

// Shared function to resolve paths for elements with a specific attribute
export default function resolvePathsForElementsWithAttribute(
  attr,
  sketchDoc,
  files
) {
  // Find all elements in the document that have the specified attribute
  const elements = sketchDoc.querySelectorAll(`[${attr}]`);

  // Convert the NodeList to an array for easier iteration
  const elementsArray = Array.prototype.slice.call(elements);

  // Iterate over each element with the specified attribute
  elementsArray.forEach((element) => {
    // Get the value of the attribute
    const attrValue = element.getAttribute(attr);

    // Use RegExp.test() instead of match() !== null
    if (MEDIA_FILE_REGEX.test(attrValue)) {
      // Resolve the file path using the provided files mapping
      const resolvedFile = resolvePathToFile(attrValue, files);

      // If the file is resolved successfully and has a URL, update the attribute
      if (resolvedFile && resolvedFile.url) {
        element.setAttribute(attr, resolvedFile.url);
      }
    }
  });
}
