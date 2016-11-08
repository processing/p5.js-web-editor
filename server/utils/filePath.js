export function resolvePathToFile(filePath, files) {
  const filePathArray = filePath.split('/');
  let resolvedFile;
  let currentFile;
  filePathArray.some((filePathSegment, index) => {
    if (filePathSegment === "" || filePathSegment === ".") {
      return false;
    } else if (filePathSegment === "..") {
      return true;
    } else {
      if (!currentFile) {
        const file = files.find(file => file.name === filePathSegment);
        if (!file) {
          return true;
        }
        currentFile = file;
        if (index === filePathArray.length - 1) {
          resolvedFile = file;
        }
      } else {
        const childFiles = currentFile.children.map(childFileId => {
          return files.find(file => {
            return file._id.valueOf().toString() === childFileId.valueOf();
          });
        });
        childFiles.some(childFile => {
          if (childFile.name === filePathSegment) {
            currentFile = childFile;
            if (index === filePathArray.length - 1) {
              resolvedFile = childFile;
            }
          }
        });
      }
    }
  });
  return resolvedFile;
}