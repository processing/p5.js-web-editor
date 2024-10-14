import { syntaxTree } from '@codemirror/language';
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view';
import {
  p5FunctionKeywords,
  p5VariableKeywords
} from '../../../utils/p5-keywords';

function createP5Decoration(node, text) {
  const isFunction = text in p5FunctionKeywords;
  const isVariable = text in p5VariableKeywords;

  if (isFunction || isVariable) {
    const className = isFunction ? 'cm-p5-function' : 'cm-p5-variable';
    return [Decoration.mark({ class: className }).range(node.from, node.to)];
  }

  return [];
}

function createDecorations(view) {
  const decorations = [];

  view.visibleRanges.forEach(({ from, to }) => {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        const text = view.state.doc.sliceString(node.from, node.to);

        if (
          node.name === 'VariableName' ||
          node.name === 'VariableDefinition'
        ) {
          decorations.push(...createP5Decoration(node, text));
        }
      }
    });
  });

  return Decoration.set(decorations);
}

const p5ViewPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = createDecorations(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = createDecorations(update.view);
      }
    }
  },
  {
    decorations: (instance) => instance.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of(
        (view) => view.plugin(plugin)?.decorations || Decoration.none
      )
  }
);

export default p5ViewPlugin;
