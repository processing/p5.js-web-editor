import { LanguageSupport, syntaxTree } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { ViewPlugin, Decoration } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { p5HinterV1 } from '../../../../../utils/p5-hinter-v1';
import { p5HinterV2 } from '../../../../../utils/p5-hinter-v2';
import { completionPreview } from './completionPreview';
import contextAwareHinter from '../../../../../utils/contextAwareHinter';

// The hinter files are generated from the p5.js reference for each major
// version, so the highlighted keywords always match the sketch's version.
function getKeywords(hints) {
  const functions = new Set();
  const variables = new Set();
  hints.forEach(({ label, type }) => {
    if (type === 'method') {
      functions.add(label);
    } else if (type === 'variable' || type === 'constant') {
      variables.add(label);
    }
  });
  return { functions, variables };
}

const p5FunctionMark = Decoration.mark({ class: 'cm-p5-function' });
const p5VariableMark = Decoration.mark({ class: 'cm-p5-variable' });

// Used to add highlighting to the p5-specific keywords.
function buildHighlightDecorations(view, { functions, variables }) {
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
        if (functions.has(name)) {
          builder.add(node.from, node.to, p5FunctionMark);
        } else if (variables.has(name)) {
          builder.add(node.from, node.to, p5VariableMark);
        }
      }
    });
  });
  return builder.finish();
}

function p5Highlight(keywords) {
  return ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = buildHighlightDecorations(view, keywords);
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildHighlightDecorations(update.view, keywords);
        }
      }
    },
    { decorations: (v) => v.decorations }
  );
}

const p5HighlightV1 = p5Highlight(getKeywords(p5HinterV1));
const p5HighlightV2 = p5Highlight(getKeywords(p5HinterV2));

export function p5JavaScript(p5Version) {
  const jsLang = javascript();

  const isV2 = p5Version?.startsWith('2.');
  const hints = isV2 ? p5HinterV2 : p5HinterV1;

  function addCompletions(context) {
    const word = context.matchBefore(/\w*/);
    const isValidWord = word?.text && word.text.trim().length >= 1;
    if (!isValidWord && !context.explicit) {
      return null;
    }

    return contextAwareHinter(context, {
      hints
    });
  }

  return new LanguageSupport(jsLang.language, [
    jsLang.extension,
    jsLang.language.data.of({
      autocomplete: addCompletions
    }),
    completionPreview(),
    isV2 ? p5HighlightV2 : p5HighlightV1
  ]);
}
