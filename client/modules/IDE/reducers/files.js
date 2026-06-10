import objectID from 'bson-objectid';
import * as ActionTypes from '../../../constants';
import {
  defaultSketch,
  defaultCSS,
  defaultHTML
} from '../../../../server/domain-objects/createDefaultFiles';
import { parseUrlParams } from '../../../utils/parseURLParams';

export const initialState = () => {
  const a = objectID().toHexString();
  const b = objectID().toHexString();
  const c = objectID().toHexString();
  const r = objectID().toHexString();
  const params = parseUrlParams(window.location.href);
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
      content: defaultHTML(params),
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

function getAllDescendantIds(state, nodeId) {
  return state
    .find((file) => file.id === nodeId)
    .children.reduce(
      (acc, childId) => [
        ...acc,
        childId,
        ...getAllDescendantIds(state, childId)
      ],
      []
    );
}

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

function sortedChildrenId(state, children) {
  const childrenArray = state.filter((file) => children.includes(file.id));
  childrenArray.sort((a, b) => (a.name > b.name ? 1 : -1));
  return childrenArray.map((child) => child.id);
}

function updateParent(state, action) {
  return state.map((file) => {
    if (file.id === action.parentId) {
      const newFile = Object.assign({}, file);
      newFile.children = [...newFile.children, action.id];
      return newFile;
    }
    return file;
  });
}

function splitPath(name) {
  const parts = name.split('/').filter(Boolean);
  const basename = parts.pop() || name;
  return {
    folders: parts,
    basename
  };
}

function findParentId(state, fileId) {
  const parent = state.find((file) => file.children.includes(fileId));
  return parent?.id;
}

function getChildFilePath(parentFile) {
  if (parentFile.name === 'root') {
    return '';
  }
  if (parentFile.filePath) {
    return `${parentFile.filePath}/${parentFile.name}`;
  }
  return parentFile.name;
}

function getOrCreateChildFolder(state, parentId, folderName) {
  const parent = state.find((file) => file.id === parentId);
  const existingFolder = parent.children
    .map((childId) => state.find((file) => file.id === childId))
    .find((file) => file?.fileType === 'folder' && file.name === folderName);

  if (existingFolder) {
    return { state, folderId: existingFolder.id };
  }

  const id = objectID().toHexString();
  const folder = {
    id,
    _id: id,
    name: folderName,
    content: '',
    fileType: 'folder',
    children: [],
    filePath: getChildFilePath(parent)
  };
  const nextState = state.map((file) => {
    if (file.id !== parentId) {
      return file;
    }
    return {
      ...file,
      children: [...file.children, id]
    };
  });

  return { state: [...nextState, folder], folderId: id };
}

function applyFilePathHierarchy(state, fileId) {
  const file = state.find((candidate) => candidate.id === fileId);
  if (!file || file.fileType === 'folder' || !file.name.includes('/')) {
    return state;
  }

  const currentParentId = findParentId(state, fileId);
  if (!currentParentId) {
    return state;
  }

  const { folders, basename } = splitPath(file.name);
  if (folders.length === 0) {
    return state;
  }

  let nextState = state.map((candidate) => {
    if (candidate.id !== currentParentId) {
      return candidate;
    }
    return {
      ...candidate,
      children: candidate.children.filter((childId) => childId !== fileId)
    };
  });
  let parentId = currentParentId;

  folders.forEach((folderName) => {
    const result = getOrCreateChildFolder(nextState, parentId, folderName);
    nextState = result.state;
    parentId = result.folderId;
  });

  nextState = nextState.map((candidate) => {
    if (candidate.id === parentId) {
      return {
        ...candidate,
        children: [...candidate.children, fileId]
      };
    }
    if (candidate.id === fileId) {
      const parent = nextState.find((parentFile) => parentFile.id === parentId);
      return {
        ...candidate,
        name: basename,
        filePath: getChildFilePath(parent)
      };
    }
    return candidate;
  });

  return nextState;
}

function renameFile(state, action) {
  return state.map((file) => {
    if (file.id !== action.id) {
      return file;
    }
    return Object.assign({}, file, {
      name: action.name,
      url: action.urlsById?.[file.id] || action.url || file.url
    });
  });
}

function setFilePath(files, fileId, path) {
  const file = files.find((f) => f.id === fileId);
  file.filePath = path;
  const newPath = path ? `${path}/${file.name}` : file.name;
  if (file.children.length === 0) return;
  file.children.forEach((childFileId) => {
    setFilePath(files, childFileId, newPath);
  });
}

function setFilePaths(files) {
  const updatedFiles = [...files];
  const rootPath = '';
  const rootFile = files.find((f) => f.name === 'root');
  rootFile.children.forEach((fileId) => {
    setFilePath(updatedFiles, fileId, rootPath);
  });
  return updatedFiles;
}

function sortAllChildren(files) {
  return files.map((file) => ({
    ...file,
    children: sortedChildrenId(files, file.children)
  }));
}

const files = (state, action) => {
  if (state === undefined) {
    state = initialState(); // eslint-disable-line
  }
  switch (action.type) {
    case ActionTypes.UPDATE_FILE_CONTENT:
      return state.map((file) => {
        if (file.id !== action.id) {
          return file;
        }

        return Object.assign({}, file, { content: action.content });
      });
    case ActionTypes.SET_BLOB_URL:
      return state.map((file) => {
        if (file.id !== action.id) {
          return file;
        }
        return Object.assign({}, file, { blobURL: action.blobURL });
      });
    case ActionTypes.NEW_PROJECT: {
      const newFiles = action.files.map((file) => {
        const corrospondingObj = state.find((obj) => obj.id === file.id);
        if (corrospondingObj && corrospondingObj.fileType === 'folder') {
          const isFolderClosed = corrospondingObj.isFolderClosed || false;
          return { ...file, isFolderClosed };
        }
        return file;
      });
      return setFilePaths(newFiles);
    }
    case ActionTypes.SET_PROJECT: {
      const newFiles = action.files.map((file) => {
        const corrospondingObj = state.find((obj) => obj.id === file.id);
        if (corrospondingObj && corrospondingObj.fileType === 'folder') {
          const isFolderClosed = corrospondingObj.isFolderClosed || false;
          return { ...file, isFolderClosed };
        }
        if (corrospondingObj) {
          return { ...file, isSelectedFile: corrospondingObj.isSelectedFile };
        }
        return file;
      });
      return setFilePaths(newFiles);
    }
    case ActionTypes.RESET_PROJECT:
      return initialState();
    case ActionTypes.CREATE_FILE: {
      const parentFile = state.find((file) => file.id === action.parentId);
      const filePath = getChildFilePath(parentFile);
      const newState = [
        ...updateParent(state, action),
        {
          name: action.name,
          id: action.id,
          _id: action._id,
          content: action.content,
          url: action.url,
          children: action.children,
          fileType: action.fileType || 'file',
          filePath
        }
      ];

      return sortAllChildren(
        setFilePaths(applyFilePathHierarchy(newState, action.id))
      );
    }
    case ActionTypes.UPDATE_FILE_NAME: {
      const newState = applyFilePathHierarchy(
        renameFile(state, action),
        action.id
      );
      const updatedFile = newState.find((file) => file.id === action.id);
      const childPath = updatedFile.filePath
        ? `${updatedFile.filePath}/${updatedFile.name}`
        : updatedFile.name;
      updatedFile.children.forEach((childId) => {
        setFilePath(newState, action.id, childPath);
      });
      return sortAllChildren(setFilePaths(newState));
    }
    case ActionTypes.DELETE_FILE: {
      const newState = deleteMany(state, [
        action.id,
        ...getAllDescendantIds(state, action.id)
      ]);
      return deleteChild(newState, action.parentId, action.id);
      // const newState = state.map((file) => {
      //   if (file.id === action.parentId) {
      //     const newChildren = file.children.filter(child => child !== action.id);
      //     return { ...file, children: newChildren };
      //   }
      //   return file;
      // });
      // return newState.filter(file => file.id !== action.id);
    }
    case ActionTypes.SET_SELECTED_FILE:
      return state.map((file) => {
        if (file.id === action.selectedFile) {
          return Object.assign({}, file, { isSelectedFile: true });
        }
        return Object.assign({}, file, { isSelectedFile: false });
      });
    case ActionTypes.SHOW_FOLDER_CHILDREN:
      return state.map((file) => {
        if (file.id === action.id) {
          return Object.assign({}, file, { isFolderClosed: false });
        }
        return file;
      });
    case ActionTypes.HIDE_FOLDER_CHILDREN:
      return state.map((file) => {
        if (file.id === action.id) {
          return Object.assign({}, file, { isFolderClosed: true });
        }
        return file;
      });
    default:
      return state.map((file) => {
        file.children = sortedChildrenId(state, file.children);
        return file;
      });
  }
};

export const getHTMLFile = (state) =>
  state.filter((file) => file.name.match(/.*\.html$/i))[0];
export const getJSFiles = (state) =>
  state.filter((file) => file.name.match(/.*\.js$/i));
export const getCSSFiles = (state) =>
  state.filter((file) => file.name.match(/.*\.css$/i));
export const getLinkedFiles = (state) => state.filter((file) => file.url);

export default files;
