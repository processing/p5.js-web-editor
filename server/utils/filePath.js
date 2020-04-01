export function resolvePathToFile(filePath, files) {
  if (filePath === undefined) {
    return false;
  }

  const filePathArray = filePath.split('/');
  let resolvedFile;
  let currentFile = files.find(file => file.name === 'root');
  filePathArray.some((filePathSegment, index) => {
    if (filePathSegment === '' || filePathSegment === '.') {
      return false;
    } else if (filePathSegment === '..') {
      return true;
    }

    let foundChild = false;
    const childFiles = currentFile.children.map(childFileId =>
      files.find(file =>
        file._id.valueOf().toString() === childFileId.valueOf()));
    childFiles.some((childFile) => {
      if (childFile.name === filePathSegment) {
        currentFile = childFile;
        foundChild = true;
        if (index === filePathArray.length - 1) {
          resolvedFile = childFile;
        }
        return true;
      }
      return false;
    });
    return !foundChild;
  });
  return resolvedFile;
}

export default resolvePathToFile;
