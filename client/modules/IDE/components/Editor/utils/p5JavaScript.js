import { LanguageSupport, syntaxTree } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { ViewPlugin, Decoration } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { p5Hinter } from '../../../../../utils/p5-hinter';
import { completionPreview } from './completionPreview';
import contextAwareHinter from '../../../../../utils/contextAwareHinter';
import {
  p5FunctionKeywords,
  p5VariableKeywords
} from '../../../../../utils/p5-keywords';

const p5Functions = new Set(Object.keys(p5FunctionKeywords));
const p5Variables = new Set(Object.keys(p5VariableKeywords));

const p5FunctionMark = Decoration.mark({ class: 'cm-p5-function' });
const p5VariableMark = Decoration.mark({ class: 'cm-p5-variable' });

// Used to add highlighting to the p5-specific keywords.
function buildHighlightDecorations(view) {
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

const p5Highlight = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = buildHighlightDecorations(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildHighlightDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

function addCompletions(context) {
  const word = context.matchBefore(/\w*/);
  const isValidWord = word?.text && word.text.trim().length >= 2;
  if (!isValidWord && !context.explicit) {
    return null;
  }

  return contextAwareHinter(context, {
    hints: p5Hinter
  });
}

export function p5JavaScript() {
  const jsLang = javascript();
  return new LanguageSupport(jsLang.language, [
    jsLang.extension,
    jsLang.language.data.of({
      autocomplete: addCompletions
    }),
    completionPreview(),
    p5Highlight
  ]);
}
