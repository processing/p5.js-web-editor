import React from 'react';
import { render, act } from '@testing-library/react';
import useCodeMirror from './codemirror';

jest.mock('../../utils/localBackup', () => ({ saveLocalBackup: jest.fn() }));

const fileA = { id: 'a', name: 'sketch.js', content: 'aaa' };
const fileB = { id: 'b', name: 'style.css', content: 'bbb' };
const root = { id: 'root', name: 'root', content: '' };

// jsdom lacks layout APIs that CodeMirror measures with.
beforeAll(() => {
  document.createRange = () => {
    const range = new Range();
    range.getClientRects = () => ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: [][Symbol.iterator]
    });
    range.getBoundingClientRect = () => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0
    });
    return range;
  };
  if (!global.structuredClone) {
    global.structuredClone = (v) => JSON.parse(JSON.stringify(v));
  }
});

describe('useCodeMirror debounced onChange', () => {
  let api;
  let props;

  function Harness(p) {
    api = useCodeMirror(p);
    return (
      <div
        ref={(el) =>
          el &&
          !api.codemirrorView.current &&
          api.setupCodeMirrorOnContainerMounted(el)
        }
      />
    );
  }

  const makeProps = (file) => ({
    project: { id: 'p1' },
    lineNumbers: true,
    linewrap: true,
    autocloseBracketsQuotes: true,
    setUnsavedChanges: jest.fn(),
    setCurrentLine: jest.fn(),
    updateFileContent: props ? props.updateFileContent : jest.fn(),
    file,
    files: [root, fileA, fileB],
    autorefresh: false,
    clearConsole: jest.fn(),
    startSketch: jest.fn(),
    autocompleteHinter: false,
    fontSize: 16,
    onUpdateLinting: jest.fn(),
    referenceBaseUrl: '',
    p5Version: '1.9.0',
    showSearch: jest.fn()
  });

  beforeEach(() => {
    jest.useFakeTimers();
    props = undefined;
    props = makeProps(fileA);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const type = (text) =>
    act(() => {
      api.codemirrorView.current.dispatch({
        changes: { from: 0, insert: text }
      });
    });

  it('debounces normal typing in one file', () => {
    const { unmount } = render(<Harness {...props} />);
    type('x');
    type('y');
    act(() => jest.advanceTimersByTime(999));
    expect(props.updateFileContent).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(props.updateFileContent).toHaveBeenCalledTimes(1);
    expect(props.updateFileContent).toHaveBeenCalledWith('a', 'yxaaa');
    expect(props.setUnsavedChanges).toHaveBeenCalledWith(true);
    unmount();
  });

  it('writes a pending edit to the edited file when switching files', () => {
    const { rerender } = render(<Harness {...props} />);
    type('x');
    rerender(<Harness {...makeProps(fileB)} />);
    act(() => jest.advanceTimersByTime(1500));
    expect(props.updateFileContent).toHaveBeenCalledWith('a', 'xaaa');
    expect(props.updateFileContent).not.toHaveBeenCalledWith('b', 'xaaa');
    expect(props.updateFileContent).not.toHaveBeenCalledWith('b', 'bbb');
  });

  it('flushes a pending change on unmount', () => {
    const { unmount } = render(<Harness {...props} />);
    type('x');
    unmount();
    expect(props.updateFileContent).toHaveBeenCalledWith('a', 'xaaa');
  });
});
