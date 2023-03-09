## Orientações de Acessiblidade

Qui está um guia de [como usar o editor acessível](https://gist.github.com/MathuraMG/e86666b7b41fbc8c078bad9aff3f666d) e aqui está uma visão geral da biblioteca [p5-accessibility.js](https://github.com/processing/p5.accessibility) que torna esboços p5.js acessíveis para leitores de tela.

O código para o editor web de p5.js adere os padrões de acessibilidade web. As orientações a seguir irão ajudar a assegurar que a acessibilidade continue sendo uma prioridade no decorrer do desenvolvimento.

**Estrutura do código**

* Leitores de tela são uma tecnologia assistiva para perda de visão, que ajuda usuários a navegar páginas web. Eles são capazes de priorizar conteúdo baseado na semantica de tags HTML. Portanto, é importante usar tags específicas como `nav`, `ul`, `li`, `section` e por aí vai. `div` é a tag menos adequada para leitores de tela. Por exemplo, [aqui está o significado semântico da tag `body`](http://html5doctor.com/element-index/#body)
* Todos os botões/links/janelas precisam ser acessíveis ao teclado (Ao apertar tab, espaço, etc.)
* Em casos em que tags não são adequadas para leitores de tela, podemos tomar vantagem de [tabIndex](http://webaim.org/techniques/keyboard/tabindex). Usar tabIndex assegura que todos os elementos são acessíveis pelo teclado. [exemplo de código](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Editor.jsx#L249)
* Enquanto abrir uma nova janela ou pop up, assegure que o foco do teclaod também irá para a nova janela. [exemplo de código](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/NewFileForm.jsx#L16)

**Marcação**

* Enquanto criar ícones de botões, imagens ou algo sem texto (isso não inclui o `<button>` do HTML5), use [aria-labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute). [exemplo de código](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Toolbar.jsx#L67)
* Todas `<table>`s precisam ter um atributo `summary`. Isso irá assegurar que o usuário terá o contexto para que serve a tabela. [exemplo de código](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/SketchList.jsx#L39)
* Menus `ul`s e `nav`s precisam incluir um título. [exemplo de código](https://github.com/processing/p5.js-web-editor/blob/master/client/components/Nav.jsx#L7)

Para mais informações sobre acessibilidade veja o [tutorial teach access](https://teachaccess.github.io/tutorial/)
