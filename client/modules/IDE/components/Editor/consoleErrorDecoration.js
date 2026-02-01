import { StateField, StateEffect } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';

// Effects for communicating with the state field
const ADD_ERROR_DECORATION = StateEffect.define();
const FILTER_ERROR_DECORATION = StateEffect.define();

// An extension for managing error line decorations
// You can call this by calling addErrorDecoration and removeErrorDecorations
export const errorDecorationStateField = StateField.define({
  // Start with an empty set of decorations
  create() {
    return Decoration.none;
  },
  // This is called whenever the editor updates
  update(value, transaction) {
    // Move the decorations to account for document changes
    let newValue = value.map(transaction.changes);
    // If this transaction adds or removes decorations, apply those changes
    for (let i = 0; i < transaction.effects.length; i++) {
      const effect = transaction.effects[i];
      if (effect.is(ADD_ERROR_DECORATION))
        newValue = newValue.update({ add: effect.value, sort: true });
      else if (effect.is(FILTER_ERROR_DECORATION))
        newValue = newValue.update({ filter: effect.value });
    }
    return newValue;
  },
  // Indicate that this field provides a set of decorations
  provide: (f) => EditorView.decorations.from(f)
});

const ERROR_DECORATION = Decoration.line({
  class: 'cm-errorLine'
});

export function addErrorDecoration(view, lineNumber) {
  const docLineNumber = view.state.doc.line(lineNumber);
  view.dispatch({
    effects: ADD_ERROR_DECORATION.of([
      ERROR_DECORATION.range(docLineNumber.from)
    ])
  });
}

export function removeErrorDecorations(view) {
  view.dispatch({
    effects: FILTER_ERROR_DECORATION.of(() => false)
  });
}
