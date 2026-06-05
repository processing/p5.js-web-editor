/**
 * @jest-environment jsdom
 */
import { EditorView, runScopeHandlers } from '@codemirror/view';
import { createNewFileState, getFileMode } from './fileState';

const defaultSettings = {
  linewrap: false,
  lineNumbers: false,
  autocomplete: false,
  autocloseBracketsQuotes: false,
  onUpdateLinting: () => {},
  onViewUpdate: () => {},
  referenceBaseUrl: 'https://p5js.org'
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

describe('createNewFileState - Settings', () => {
  function getDocText(cmView) {
    return cmView.state.doc.toString();
  }

  it('Enables line wrap', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: true,
      lineNumbers: true,
      autocomplete: false,
      autocloseBracketsQuotes: false,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };
    const result = createNewFileState(fileName, content, settings);

    const parent = document.createElement('div');
    const cmView = new EditorView({ state: result.cmState, parent });
    const div = parent.querySelector('.cm-lineWrapping');

    expect(div).not.toBeNull();
  });

  it('Disable line wrap', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: false,
      lineNumbers: true,
      autocomplete: false,
      autocloseBracketsQuotes: false,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };
    const result = createNewFileState(fileName, content, settings);

    const parent = document.createElement('div');
    const cmView = new EditorView({ state: result.cmState, parent });
    const div = parent.querySelector('.cm-lineWrapping');

    expect(div).toBeNull();
  });

  it('Enables line numbers', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: false,
      lineNumbers: true,
      autocomplete: false,
      autocloseBracketsQuotes: false,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };
    const result = createNewFileState(fileName, content, settings);

    const parent = document.createElement('div');
    const cmView = new EditorView({ state: result.cmState, parent });
    const div = parent.querySelector('.cm-lineNumbers');

    expect(div).not.toBeNull();
  });

  it('Disable line numbers', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: false,
      lineNumbers: false,
      autocomplete: false,
      autocloseBracketsQuotes: false,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };
    const result = createNewFileState(fileName, content, settings);

    const parent = document.createElement('div');
    const cmView = new EditorView({ state: result.cmState, parent });
    const div = parent.querySelector('.cm-lineNumbers');

    expect(div).toBeNull();
  });

  it('Enable autocomplete', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: false,
      lineNumbers: false,
      autocomplete: true,
      autocloseBracketsQuotes: false,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };
    const result = createNewFileState(fileName, content, settings);

    const parent = document.createElement('div');
    const cmView = new EditorView({ state: result.cmState, parent });
    const div = parent.querySelector('.cm-content');

    expect(div).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('Disable autocomplete', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: false,
      lineNumbers: false,
      autocomplete: false,
      autocloseBracketsQuotes: false,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };
    const result = createNewFileState(fileName, content, settings);

    const parent = document.createElement('div');
    const cmView = new EditorView({ state: result.cmState, parent });
    const div = parent.querySelector('.cm-content');

    expect(div).not.toHaveAttribute('aria-autocomplete', 'list');
  });

  it('Enables autoclose brackets and quotes', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: false,
      lineNumbers: false,
      autocomplete: false,
      autocloseBracketsQuotes: true,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };

    const result = createNewFileState(fileName, content, settings);

    expect(result.closeBracketsCpt.get(result.cmState).length).toBeGreaterThan(
      0
    );
  });

  it('Disable autoclose brackets and quotes', () => {
    const fileName = 'file1.js';
    const content = ``;
    const settings = {
      linewrap: false,
      lineNumbers: false,
      autocomplete: false,
      autocloseBracketsQuotes: false,
      onUpdateLinting: jest.fn(),
      onViewUpdate: jest.fn()
    };

    const result = createNewFileState(fileName, content, settings);

    expect(result.closeBracketsCpt.get(result.cmState).length).toBe(0);
  });
});

describe('getFileMode', () => {
  it('Returns correct javascript file mode', () => {
    const fileName = 'file1.js';
    const mode = getFileMode(fileName);
    const expectedMode = 'javascript';

    expect(mode).toBe(expectedMode);
  });

  it('Returns correct css file mode', () => {
    const fileName = 'file1.css';
    const mode = getFileMode(fileName);
    const expectedMode = 'css';

    expect(mode).toBe(expectedMode);
  });

  it('Returns correct html file mode', () => {
    const fileName = 'file1.html';
    const mode = getFileMode(fileName);
    const expectedMode = 'html';

    expect(mode).toBe(expectedMode);
  });

  it('Returns correct xml file mode', () => {
    const fileName = 'file1.xml';
    const mode = getFileMode(fileName);
    const expectedMode = 'xml';

    expect(mode).toBe(expectedMode);
  });

  it('Returns correct json file mode', () => {
    const fileName = 'file1.json';
    const mode = getFileMode(fileName);
    const expectedMode = 'application/json';

    expect(mode).toBe(expectedMode);
  });

  it('Returns correct frag|glsl file mode', () => {
    const fileName = 'file1.frag';
    const fileName2 = 'file2.glsl';
    const mode = getFileMode(fileName);
    const mode2 = getFileMode(fileName2);
    const expectedMode = 'x-shader/x-fragment';

    expect(mode).toBe(expectedMode);
    expect(mode2).toBe(expectedMode);
  });

  it('Returns correct vert|stl|mtl file mode', () => {
    const fileName = 'file1.vert';
    const fileName2 = 'file2.stl';
    const fileName3 = 'file3.mtl';
    const mode = getFileMode(fileName);
    const mode2 = getFileMode(fileName2);
    const mode3 = getFileMode(fileName3);
    const expectedMode = 'x-shader/x-vertex';

    expect(mode).toBe(expectedMode);
    expect(mode2).toBe(expectedMode);
    expect(mode3).toBe(expectedMode);
  });

  it('Returns plain text otherwise file mode', () => {
    const fileName = 'file1.py';
    const mode = getFileMode(fileName);
    const expectedMode = 'text/plain';
    expect(mode).toBe(expectedMode);
  });

  it('Empty fileName', () => {
    const fileName = '';
    const mode = getFileMode(fileName);
    const expectedMode = 'text/plain';
    expect(mode).toBe(expectedMode);
  });

  it('Unknown fileName', () => {
    const fileName = 'file1.xyz';
    const mode = getFileMode(fileName);
    const expectedMode = 'text/plain';
    expect(mode).toBe(expectedMode);
  });
});
