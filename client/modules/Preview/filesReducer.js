import { useMemo } from 'react';
import objectID from 'bson-objectid';

const defaultSketch = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}`;

const defaultHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.2.0/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.2.0/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />

  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
`;

const defaultCSS = `html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
`;

// https://gist.github.com/fnky/7d044b94070a35e552f3c139cdf80213
export function useSelectors(state, mapStateToSelectors) {
  const selectors = useMemo(() => mapStateToSelectors(state), [state]);
  return selectors;
}

export function getFileSelectors(state) {
  return {
    getHTMLFile: () => state.filter((file) => file.name.match(/.*\.html$/i))[0],
    getJSFiles: () => state.filter((file) => file.name.match(/.*\.js$/i)),
    getCSSFiles: () => state.filter((file) => file.name.match(/.*\.css$/i))
  };
}

export function initialState() {
  const a = objectID().toHexString();
  const b = objectID().toHexString();
  const c = objectID().toHexString();
  const r = objectID().toHexString();
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
      children: []
    },
    {
      name: 'index.html',
      content: defaultHTML,
      id: b,
      _id: b,
      fileType: 'file',
      children: []
    },
    {
      name: 'style.css',
      content: defaultCSS,
      id: c,
      _id: c,
      fileType: 'file',
      children: []
    }
  ];
}

function sortedChildrenId(state, children) {
  const childrenArray = state.filter((file) => children.includes(file.id));
  childrenArray.sort((a, b) => (a.name > b.name ? 1 : -1));
  return childrenArray.map((child) => child.id);
}

export function setFiles(files) {
  return {
    type: 'SET_FILES',
    files
  };
}

export function filesReducer(state, action) {
  switch (action.type) {
    case 'SET_FILES':
      return action.files;
    default:
      return state.map((file) => {
        file.children = sortedChildrenId(state, file.children);
        return file;
      });
  }
}
