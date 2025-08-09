import { LanguageSupport } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { p5Hinter } from '../../../../utils/p5-hinter-cm6';

function testCompletions(context) {
  const word = context.matchBefore(/\w*/);
  if (word.from === word.to && !context.explicit) return null;

  function addDomNodeInfo(item) {
    const itemCopy = { ...item };

    if (item.p5DocPath) {
      // TODO: Use the option below to add the p5 link for *all* hints.
      // https://codemirror.net/docs/ref/#autocomplete.autocompletion^config.addToOptions
      itemCopy.info = () => {
        const domNode = document.createElement('a');
        domNode.href = `https://p5js.org/reference/p5/${item.p5DocPath}`;
        domNode.role = 'link';
        domNode.target = '_blank';
        domNode.onclick = (event) => event.stopPropagation();
        domNode.innerHTML = `
        <span class="hint-hidden">open ${item.label} reference</span>
        <span aria-hidden="true">&#10132;</span>
      `;
        return {
          dom: domNode,
          destroy: () => {
            // Cleanup logic if needed
            domNode.remove();
          }
        };
      };
    }

    return itemCopy;
  }

  const hinterWithDomNodes = p5Hinter.map(addDomNodeInfo);

  return {
    from: word.from,
    options: hinterWithDomNodes
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
