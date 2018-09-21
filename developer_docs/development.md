# Development

A guide for adding code to this project.

## Tooling and Style Overview

The p5.js Web Editor is built on a MERN stack - MongoDB, Express, React/Redux, and Node. For a reference to the file structure format this project is am using, please look at the [Mern Starter](https://github.com/Hashnode/mern-starter) and [this comment](https://github.com/Hashnode/mern-starter/issues/90#issuecomment-221553573).

This project uses an in-development [p5-accessibility.js library](https://github.com/processing/p5.accessibility) for accessibility.

This project does not use CSS Modules, styled-components, or other CSS-in-JS libraries, but uses Sass. It also follows [BEM rules](http://getbem.com/) for CSS naming conventions, follows OOSCSS with placeholders and mixins, and follows the [7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) for Sass.

This project is using [ES6](http://es6-features.org/) and transpiling to ES5 using [Babel](https://babeljs.io/). For reference to the JavaScript style guide, see the [Airbnb Style Guide](https://github.com/airbnb/javascript), [React ESLint Plugin](https://github.com/yannickcr/eslint-plugin-react).

The ESLint configuration is based on a few popular React/Redux boilerplates. Open to suggestions on this. If in development, you're getting annoyed with ESLint, you can remove it from `webpack.config.dev.js` in the JavaScript loader, or disable any line from eslint by commenting at the end of the line `// eslint-disable-line`.