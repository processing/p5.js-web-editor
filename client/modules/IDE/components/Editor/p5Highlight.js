import { ViewPlugin, Decoration } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import {
  p5FunctionKeywords,
  p5VariableKeywords
} from '../../../../utils/p5-keywords';

const p5Functions = new Set(Object.keys(p5FunctionKeywords));
const p5Variables = new Set(Object.keys(p5VariableKeywords));

const p5FunctionMark = Decoration.mark({ class: 'cm-p5-function' });
const p5VariableMark = Decoration.mark({ class: 'cm-p5-variable' });

function buildDecorations(view) {
  const builder = new RangeSetBuilder();
  view.visibleRanges.forEach(({ from, to }) => {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        const isVariable = node.name === 'VariableName';
        const isDefinition = node.name === 'VariableDefinition';
        if (!isVariable && !isDefinition) return;
        const name = view.state.doc.sliceString(node.from, node.to);
        if (p5Functions.has(name)) {
          builder.add(node.from, node.to, p5FunctionMark);
        } else if (p5Variables.has(name)) {
          builder.add(node.from, node.to, p5VariableMark);
        }
      }
    });
  });
  return builder.finish();
}

export const p5Highlight = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = buildDecorations(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);
