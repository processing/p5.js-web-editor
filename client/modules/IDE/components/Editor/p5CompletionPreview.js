import { StateField, RangeSetBuilder } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { selectedCompletion, completionStatus } from '@codemirror/autocomplete';

// TODO: Review
class GhostTextWidget extends WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }

  eq(other) {
    return other.text === this.text;
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-ghostCompletion';
    span.textContent = this.text;
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

function getCurrentWord(state) {
  const { from, to, empty } = state.selection.main;
  if (!empty) return null;

  const line = state.doc.lineAt(from);
  const before = line.text.slice(0, from - line.from);
  const match = before.match(/\w+$/);

  if (!match) return null;

  const word = match[0];
  return {
    text: word,
    from: from - word.length,
    to
  };
}

function buildGhostText(state) {
  if (completionStatus(state) !== 'active') return null;

  const selected = selectedCompletion(state);
  if (!selected) return null;

  const word = getCurrentWord(state);
  if (!word) return null;

  const preview = selected.preview || selected.label;
  if (!preview) return null;

  if (!preview.toLowerCase().startsWith(word.text.toLowerCase())) return null;

  const remainder = preview.slice(word.text.length);
  if (!remainder) return null;

  return {
    pos: word.to,
    text: remainder
  };
}

const ghostTextField = StateField.define({
  create(state) {
    return Decoration.none;
  },

  update(deco, tr) {
    const builder = new RangeSetBuilder();
    const ghost = buildGhostText(tr.state);

    if (ghost) {
      builder.add(
        ghost.pos,
        ghost.pos,
        Decoration.widget({
          widget: new GhostTextWidget(ghost.text),
          side: 1
        })
      );
    }

    return builder.finish();
  },

  provide: (field) => EditorView.decorations.from(field)
});

export const p5CompletionPreviewTheme = EditorView.theme({
  '.cm-ghostCompletion': {
    opacity: '0.55',
    fontStyle: 'italic',
    pointerEvents: 'none',
    whiteSpace: 'pre'
  }
});

export function p5CompletionPreview() {
  return [ghostTextField, p5CompletionPreviewTheme];
}
