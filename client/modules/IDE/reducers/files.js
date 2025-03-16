import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';
import {
  defaultSketch,
  defaultCSS,
  defaultHTML
} from '../../../../server/domain-objects/createDefaultFiles';

export const initialState = () => {
  const r = nanoid();
  const a = nanoid();
  const b = nanoid();
  const c = nanoid();

  return [
    {
      name: 'root',
      id: r,
      _id: r,
      children: [b, a, c],
      fileType: 'folder',
      content: ''
    },
    {
      name: 'sketch.js',
      content: defaultSketch,
      id: a,
      _id: a,
      isSelectedFile: true,
      fileType: 'file',
      children: [],
      filePath: ''
    },
    {
      name: 'index.html',
      content: defaultHTML,
      id: b,
      _id: b,
      fileType: 'file',
      children: [],
      filePath: ''
    },
    {
      name: 'style.css',
      content: defaultCSS,
      id: c,
      _id: c,
      fileType: 'file',
      children: [],
      filePath: ''
    }
  ];
};

export const getAllDescendantIds = (state, nodeId) => {
  const node = state.find((file) => file.id === nodeId);
  if (!node || !node.children.length) return [];
  return node.children.flatMap((childId) => [
    childId,
    ...getAllDescendantIds(state, childId)
  ]);
};

function deleteChild(state, parentId, id) {
  const newState = state.map((file) => {
    if (file.id === parentId) {
      const newFile = Object.assign({}, file);
      newFile.children = newFile.children.filter((child) => child !== id);
      return newFile;
    }
    return file;
  });
  return newState;
}

function deleteMany(state, ids) {
  const newState = [...state];
  ids.forEach((id) => {
    let fileIndex;
    newState.find((file, index) => {
      if (file.id === id) {
        fileIndex = index;
      }
      return file.id === id;
    });
    newState.splice(fileIndex, 1);
  });
  return newState;
}

export function sortedChildrenId(state, children) {
  return children
    .map((id) => state.find((file) => file.id === id))
    .filter(Boolean) // Remove undefined values
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((file) => file.id);
}

export function updateParent(state, action) {
  return state.map((file) =>
    file.id === action.parentId
      ? { ...file, children: [...file.children, action.id] }
      : file
  );
}

export function renameFile(state, action) {
  return state.map((file) =>
    file.id === action.id ? { ...file, name: action.name } : file
  );
}

export function setFilePath(files, fileId, path) {
  const file = files.find((f) => f.id === fileId);
  if (!file) return;

  file.filePath = path;
  const newPath = path ? `${path}/${file.name}` : file.name;

  file.children.forEach((childId) => {
    setFilePath(files, childId, newPath);
  });
}

export const setFilePaths = (files) => {
  const updatedFiles = [...files];
  const rootFile = updatedFiles.find((f) => f.name === 'root');

  if (rootFile) {
    rootFile.children.forEach((fileId) =>
      setFilePath(updatedFiles, fileId, '')
    );
  }

  return updatedFiles;
};

const filesSlice = createSlice({
  name: 'files',
  initialState: initialState(),
  reducers: {
    updateFileContent: (state, action) => {
      const file = state.find((x) => x.id === action.payload.id);
      if (file) file.content = action.payload.content;
    },
    setBlobURL: (state, action) => {
      const file = state.find((x) => x.id === action.payload.id);
      if (file) file.blobURL = action.payload.blobURL;
    },
    newProject(state, action) {
      return setFilePaths(
        action.payload.files.map((file) => {
          const existingFile = state.find((obj) => obj.id === file.id);
          return existingFile?.fileType === 'folder'
            ? { ...file, isFolderClosed: existingFile.isFolderClosed || false }
            : file;
        })
      );
    },
    setProject(state, action) {
      if (!action.payload.files) return state;
      action.payload.files.forEach((file) => {
        const correspondingObj = state.find((obj) => obj.id === file.id);

        if (correspondingObj && correspondingObj.fileType === 'folder') {
          file.isFolderClosed = correspondingObj.isFolderClosed || false;
        }
      });

      return setFilePaths(action.payload.files);
    },
    resetProject: () => initialState,
    createFile: (state, action) => {
      const {
        name,
        id,
        _id,
        content,
        url,
        children,
        fileType,
        parentId
      } = action.payload;

      // Find parent file
      const parentFile = state.files.find((file) => file.id === parentId);

      // Construct file path
      const filePath =
        parentFile.name === 'root'
          ? ''
          : `${parentFile.filePath}/${parentFile.name}`;

      // Create new file object
      const newFile = {
        name,
        id,
        _id,
        content: content || '',
        url: url || '',
        children: children || [],
        fileType: fileType || 'file',
        filePath
      };

      // Add new file to state
      state.files.push(newFile);

      // Update parent's children list if applicable
      if (parentFile) {
        parentFile.children.push(newFile.id);
        parentFile.children = sortedChildrenId(
          state.files,
          parentFile.children
        );
      }

      return newFile; // Returning this does not affect Redux state but might be useful for debugging
    },
    updateFileName(state, action) {
      const file = state.find((x) => x.id === action.payload.id);
      if (file) {
        const childPath = `${file.filePath}/${action.payload.name}`;
        file.name = action.payload.name;
        file.children.forEach((childId) => {
          setFilePath(state, action.payload.id, childPath);
        });
      }
    },
    DeleteFile(state, action) {
      const newState = deleteMany(state, [
        action.payload.id,
        ...getAllDescendantIds(state, action.payload.id)
      ]);
      return deleteChild(newState, action.parentId, action.id);
    },
    setSelectedFile: (state, action) => {
      state.forEach((file) => {
        file.isSelectedFile = file.id === action.payload.selectedFile;
      });
    },
    showFolderChildren: (state, action) => {
      const file = state.find((x) => x.id === action.payload.id);
      if (file) file.isFolderClosed = false;
    },
    hideFolderChildren(state, action) {
      const file = state.find((x) => x.id === action.payload.id);
      if (file) file.isFolderClosed = true;
    }
  }
});

export const {
  updateFileContent,
  setBlobURL,
  newProject,
  setProject,
  resetProject,
  createFile,
  updateFileName,
  DeleteFile,
  setSelectedFile,
  showFolderChildren,
  hideFolderChildren
} = filesSlice.actions;

export const getHTMLFile = (state) =>
  state.filter((file) => file.name.match(/.*\.html$/i))[0];
export const getJSFiles = (state) =>
  state.filter((file) => file.name.match(/.*\.js$/i));
export const getCSSFiles = (state) =>
  state.filter((file) => file.name.match(/.*\.css$/i));
export const getLinkedFiles = (state) => state.filter((file) => file.url);

export default filesSlice.reducer;
