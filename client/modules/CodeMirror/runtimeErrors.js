import { EditorView, Decoration } from '@codemirror/view';
import {
  StateEffect,
  StateField,
  RangeSet,
  RangeSetBuilder
} from '@codemirror/state';

export const setRuntimeErrorsEffect = StateEffect.define();

export const clearRuntimeErrorsEffect = StateEffect.define();

export const clearRuntimeErrors = (view) => {
  view.dispatch({
    effects: clearRuntimeErrorsEffect.of()
  });
  return true; // TODO: only return true if there were errors to clear.
};

const lineError = Decoration.line({
  attributes: { class: 'line-runtime-error' }
});

function createDecorations(errors, doc) {
  console.log('creating', errors);
  const builder = new RangeSetBuilder();
  errors.forEach((error) => {
    const line = doc.line(error.line);
    // Could add additional deco with the character range of the error.
    builder.add(line.from, line.to, lineError);
  });
  return builder.finish();
}

const emptyState = () => {
  console.log('cleared error deco');
  return {
    lastClearedTime: Date.now(),
    decorations: RangeSet.empty
  };
};

const runtimeErrorState = StateField.define({
  create() {
    return emptyState();
  },
  update(prevState, transaction) {
    let state = prevState;

    if (transaction.docChanged) {
      state = emptyState();
    }

    transaction.effects.forEach((effect) => {
      if (effect.is(setRuntimeErrorsEffect)) {
        state.decorations = createDecorations(
          [effect.value],
          transaction.state.doc
        );
      } else if (effect.is(clearRuntimeErrorsEffect)) {
        state = emptyState();
      }
    });

    console.log('decorations', state.decorations.size);

    return state;
  },
  provide: (field) =>
    EditorView.decorations.from(field, (state) => state.decorations)
});

export default runtimeErrorState;

// Can also define plugin with   EditorView.decorations.compute()
