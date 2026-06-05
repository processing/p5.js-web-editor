/**
 * @jest-environment jsdom
 */
import { EditorView, runScopeHandlers } from '@codemirror/view';
import { createNewFileState } from './fileState';

const defaultSettings = {
  linewrap: false,
  lineNumbers: false,
  autocomplete: false,
  autocloseBracketsQuotes: false,
  onUpdateLinting: () => {},
  onViewUpdate: () => {},
  referenceBaseUrl: 'https://p5js.org',
  p5Version: '1.11.13'
};

function mountFile(filename, doc) {
  const { cmState } = createNewFileState(filename, doc, defaultSettings);
  const parent = document.createElement('div');
  document.body.appendChild(parent);
  const view = new EditorView({ state: cmState, parent });
  return view;
}

function pressTidyShortcut(view) {
  const event = new KeyboardEvent('keydown', {
    key: 'F',
    code: 'KeyF',
    shiftKey: true,
    ctrlKey: true
  });
  runScopeHandlers(view, event, 'editor');
}

describe('createNewFileState — Tidy keyboard shortcut', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  // Regression test for https://github.com/processing/p5.js-web-editor/issues/4093
  // Each file's Shift-Mod-F binding must only tidy with its own mode, regardless
  // of the order in which the file states were created.
  it('tidies each file with its own mode regardless of creation order', () => {
    const jsView = mountFile('sketch.js', `function foo(){console.log("hi")}`);
    const cssView = mountFile('style.css', `body{margin:0;padding:0;}`);
    const htmlView = mountFile('index.html', `<html><body>hello</body></html>`);

    pressTidyShortcut(jsView);
    pressTidyShortcut(cssView);
    pressTidyShortcut(htmlView);

    expect(jsView.state.doc.toString()).toBe(
      'function foo() {\n  console.log("hi");\n}\n'
    );
    expect(cssView.state.doc.toString()).toBe(
      'body {\n  margin: 0;\n  padding: 0;\n}\n'
    );
    expect(htmlView.state.doc.toString()).toBe(
      '<html>\n  <body>\n    hello\n  </body>\n</html>\n'
    );
  });
});
