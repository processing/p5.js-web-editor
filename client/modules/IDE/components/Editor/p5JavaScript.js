import { LanguageSupport } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { p5Hinter } from '../../../../utils/p5-hinter';
import { p5CompletionPreview } from './p5CompletionPreview';
import contextAwareHinter from '../../../../utils/contextAwareHinter';

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

export default function p5JavaScript() {
  const jsLang = javascript();
  return new LanguageSupport(jsLang.language, [
    jsLang.extension,
    jsLang.language.data.of({
      autocomplete: addCompletions
    }),
    p5CompletionPreview()
  ]);
}
