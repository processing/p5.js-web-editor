import { LanguageSupport } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';

function testCompletions(context) {
  const word = context.matchBefore(/\w*/);
  if (word.from === word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: [
      { label: 'connie', type: 'keyword' },
      { label: 'rachel', type: 'variable', info: '(World)' },
      { label: 'claire', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' }
    ]
  };
}

export default function p5JavaScript() {
  const jsLang = javascript();
  return new LanguageSupport(jsLang.language, [
    jsLang.extension,
    jsLang.language.data.of({
      autocomplete: testCompletions
    })
  ]);
}
