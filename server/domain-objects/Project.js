import isPlainObject from 'lodash/isPlainObject';
import pick from 'lodash/pick';
import Project from '../models/project';
import createId from '../utils/createId';
import createApplicationErrorClass from '../utils/createApplicationErrorClass';
import createDefaultFiles from './createDefaultFiles';

export const FileValidationError = createApplicationErrorClass(
  'FileValidationError'
);
export const ProjectValidationError = createApplicationErrorClass(
  'ProjectValidationError'
);

/**
 * This converts between a mongoose Project model
 * and the public API Project object properties
 *
 */
export function toApi(model) {
  return {
    id: model.id,
    name: model.name
  };
}

/**
 * Transforms a tree of files matching the APIs DirectoryContents
 * format into the data structure stored in mongodb
 *
 * - flattens the tree into an array of file/folders
 * - each file/folder gets a generated BSON-ID
 * - each folder has a `children` array containing the IDs of it's children
 */
function transformFilesInner(tree = {}, parentNode) {
  const files = [];
  const errors = [];

  Object.entries(tree).forEach(([name, params]) => {
    const id = createId();
    const isFolder = params.files != null;

    if (isFolder) {
      const folder = {
        _id: id,
        name,
        fileType: 'folder',
        children: [] // Initialise an empty folder
      };

      files.push(folder);

      // The recursion will return a list of child files/folders
      // It will also push the child's id into `folder.children`
      const subFolder = transformFilesInner(params.files, folder);
      files.push(...subFolder.files);
      errors.push(...subFolder.errors);
    } else {
      const file = {
        _id: id,
        name,
        fileType: 'file'
      };

      if (typeof params.url === 'string') {
        file.url = params.url;
      } else if (typeof params.content === 'string') {
        file.content = params.content;
      } else {
        errors.push({ name, message: "missing 'url' or 'content'" });
      }

      files.push(file);
    }

    // Push this child's ID onto it's parent's list
    // of children
    if (parentNode != null) {
      parentNode.children.push(id);
    }
  });

  return { files, errors };
}

export function transformFiles(tree = {}) {
  const withRoot = {
    root: {
      files: tree
    }
  };

  const { files, errors } = transformFilesInner(withRoot);

  if (errors.length > 0) {
    const message = `${
      errors.length
    } files failed validation. See error.files for individual errors.
    
    Errors:
      ${errors.map((e) => `* ${e.name}: ${e.message}`).join('\n')}
`;
    const error = new FileValidationError(message);
    error.files = errors;

    throw error;
  }

  return files;
}

export function containsRootHtmlFile(tree) {
  return Object.keys(tree).find((name) => /\.html$/.test(name)) != null;
}

/**
 * This converts between the public API's Project object
 * properties and a mongoose Project model
 *
 */
export function toModel(object) {
  let files = [];
  let tree = object.files;

  if (isPlainObject(tree)) {
    if (!containsRootHtmlFile(tree)) {
      tree = Object.assign(createDefaultFiles(), tree);
    }

    files = transformFiles(tree);
  } else {
    throw new FileValidationError("'files' must be an object");
  }

  const projectValues = pick(object, ['user', 'name', 'slug']);
  projectValues.files = files;

  return new Project(projectValues);
}
