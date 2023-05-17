/**
 * @param {import('@codemirror/view').EditorView} editor
 * @param {string} content
 */
// eslint-disable-next-line import/prefer-default-export
export function replaceContent(editor, content) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: content }
  });
}
