# Desenvolvimento

Um guia para adicionar código nesse projeto.

## Instalação
Sigua o [guia de instalação](https://github.com/processing/p5.js-web-editor/blob/master/developer_docs/pt-br/installation.md).

## Testes
Para rodar a suite de testes apenas rode `npm test` (depois de instalar as dependências com `npm install`)

Um exemplo de teste unitário pode ser encontrado aqui: [Nav.test.jsx](../client/components/__test__/Nav.test.jsx).

## Design
- [Guia de estilo/Design System on Figma](https://github.com/processing/p5.js-web-editor/labels/good%20medium%20issues)
- [ùltimo Design no Figma](https://www.figma.com/file/5KychMUfHlq97H0uDsen1U/p5-web-editor-2017.p.copy?node-id=0%3A1). Note que o design atual no website se divergiu, partes desse design não serão implementados, mas ainda é útil telos por perto para referência.
- [Designs para dispositivos móveis](https://www.figma.com/file/5KychMUfHlq97H0uDsen1U/p5-web-editor-2017.p.copy?node-id=0%3A2529), [Designs Responsivos](https://www.figma.com/file/5KychMUfHlq97H0uDsen1U/p5-web-editor-2017.p.copy?node-id=0%3A3292)

# Tecnologias usadas

**MERN stack** - MongoDB, Express, React/Redux e Node. 

 - Para uma referência para a **estrutura de arquivos** que esse projeto está usando, por favor olhe no [Mern Starter](https://github.com/Hashnode/mern-starter).

 - Esse projeto não utiliza CSS Modules, styled-components, ou outras bibliotecas CSS-in-JS, mas usa Sass. [Orientações BEM e convenções de nome](http://getbem.com/) são seguidas. 
 
 - Para estilos comuns e reutilizáveis, escreva OOSCSS (Object-Oriented SCSS) com placeholders e mixins. Para organizar estilos, siga o [Padrão 7-1](https://sass-guidelin.es/#the-7-1-pattern) para Sass.

 - Estamos usando [ES6](http://es6-features.org/) e transpilando para ES5 usando [Babel](https://babeljs.io/). 

 - Para referência para o guia de estilo de Javascript, veja o [Guia de Estilo do Airbnb](https://github.com/airbnb/javascript), [React ESLint Plugin](https://github.com/yannickcr/eslint-plugin-react).

 - A configuração de ESLint é baseada em alguns boilerplates populares de React/Redux. Abra para sugerir nisso. Se em desenvolvimento, você estiver ficando irritado com o ESLint, você pode remover temporariamente o `eslint-loader` do `webpack/config.dev.js` no JavaScript loader ou desativar qualquer linha de usar o eslint comentando `// eslint-disable-line` na linha.

 - [Jest](https://jestjs.io/) para testes unitários e testes de snapshop junto com o [Enzyme](https://airbnb.io/enzyme/) para testar React.