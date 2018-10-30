# Development

A guide for adding code to this project.

## Installation
Follow the [installation guide](https://github.com/processing/p5.js-web-editor/blob/master/developer_docs/installation.md).

## Tests
To run the test suite simply run `npm test` (after installing dependencies with `npm install`)

A sample unit test could be found here: [Nav.test.jsx](../client/components/__test__/Nav.test.jsx).

## Design
Design proposed and theme changes are present at: [Zeplin](https://scene.zeplin.io/project/55f746c54a02e1e50e0632c3).

# Technologies Used

**MERN stack** - MongoDB, Express, React/Redux, and Node. 
 
 - For a reference to the **file structure format** this project is using, please look at the [Mern Starter](https://github.com/Hashnode/mern-starter).

 - This project does not use CSS Modules, styled-components, or other CSS-in-JS libraries, but uses Sass. [BEM guidelines and naming conventions](http://getbem.com/) are followed. 
 
 - For common and reusable styles, write OOSCSS (Object-Oriented SCSS) with placeholders and mixins. For organizing styles, follow the [7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) for Sass.

 - We're using [ES6](http://es6-features.org/) and transpiling to ES5 using [Babel](https://babeljs.io/). 

 - For reference to the JavaScript style guide, see the [Airbnb Style Guide](https://github.com/airbnb/javascript), [React ESLint Plugin](https://github.com/yannickcr/eslint-plugin-react).

 - The ESLint configuration is based on a few popular React/Redux boilerplates. Open to suggestions on this. If in development, you're getting annoyed with ESLint, you can temporarily remove the `eslint-loader` it from `webpack/config.dev.js` in the JavaScript loader, or disable any line from eslint by commenting at the end of the line `// eslint-disable-line`.

 - [Jest](https://jestjs.io/) for unit tests and snapshot testing along with [Enzyme](https://airbnb.io/enzyme/) for testing React.