/**
 * @param {import('@codemirror/view').EditorView} editor
 * @param {string} content
 * @return {void}
 */
// eslint-disable-next-line import/prefer-default-export
export function replaceContent(editor, content) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: content }
  });
}

/**
 * @param {import('@codemirror/view').EditorView} editor
 * @return {number}
 */
export function cursorLineNumber(editor) {
  const cursor = editor.state.selection.main.head;
  return editor.state.doc.lineAt(cursor).number;
}
