# Development

A guide for adding code to this project.

- [Development](#development)
  - [Installation](#installation)
  - [Development Workflow](#development-workflow)
  - [Tests](#tests)
  - [Writing Git Commit Messages](#writing-git-commit-messages)
    - [Tips](#tips)
  - [Design](#design)
  - [Technologies Used](#technologies-used)

## Installation
Follow the [installation guide](./installation.md).

## Development Workflow
* This project uses git-flow. For an in-depth overview of git-flow, read ["A successful Git branching model"](https://nvie.com/posts/a-successful-git-branching-model/).
* [Let's stop saying Master/Slave](https://medium.com/@mikebroberts/let-s-stop-saying-master-slave-10f1d1bf34df)

As a person contributing code but not creating production releases (this is most people!), here's what you need to know:
* The default branch is `develop`. All pull requests should be made to this branch. It should be stable, and all commits are visible at a staging sever.
* When working on a bug or feature, you should branch from the `develop` branch. When you're done, you should open a pull request from your feature branch to `develop`.
* The `release` branch is the live production branch, and is the code deployed to editor.p5js.org. Changes to this branch should be made carefully, and will be done using git tags. 
* Emergency hotfix changes should be branched from `release` and merged via a pull request to `release`. After a PR is merged, then the commits can be merged to `develop`.

See the [release guide](./release.md) for information about creating a release.

## Tests
To run the test suite simply run `npm test` (after installing dependencies with `npm install`)

A sample unit test could be found here: [Nav.test.jsx](../client/components/__test__/Nav.test.jsx).

## Writing Git Commit Messages

Good commit messages serve at least three important purposes:

* They speed up the reviewing process.
* They help us write good release notes.
* They help future maintainers understand your change and the reasons behind it.

Structure your commit message like this:

 ```
 Short (50 chars or less) summary of changes ( involving Fixes #Issue-number keyword )

 More detailed explanatory text, if necessary. Wrap it to about 72
 characters or so. In some contexts, the first line is treated as the
 subject of an email and the rest of the text as the body. The blank
 line separating the summary from the body is critical (unless you omit
 the body entirely); tools like rebase can get confused if you run the
 two together.

 Further paragraphs come after blank lines.

   - Bullet points are okay, too

   - Typically a hyphen or asterisk is used for the bullet, preceded by a
     single space, with blank lines in between, but conventions vary here
 ```

* Write the summary line and description of what you have done in the imperative mode, that is as if you were commanding someone. Start the line with "Fix", "Add", "Change" instead of "Fixed", "Added", "Changed".
* Always leave the second line blank.
* Be as descriptive as possible in the description. It helps reasoning about the intention of commits and gives more context about why changes happened.

### Tips

* If it seems difficult to summarize what your commit does, it may be because it includes several logical changes or bug fixes, and are better split up into several commits using `git add -p`.

## Design
- [Style Guide/Design System on Figma](https://github.com/processing/p5.js-web-editor/labels/good%20medium%20issues)
- [Latest Design on Figma](https://www.figma.com/file/5KychMUfHlq97H0uDsen1U/p5-web-editor-2017.p.copy?node-id=0%3A1). Note that the current design on the website has diverged, are parts of this design will not be implemented, but it is still helpful to have around for reference.
- [Mobile Designs](https://www.figma.com/file/5KychMUfHlq97H0uDsen1U/p5-web-editor-2017.p.copy?node-id=0%3A2529), [Responsive Designs](https://www.figma.com/file/5KychMUfHlq97H0uDsen1U/p5-web-editor-2017.p.copy?node-id=0%3A3292)

## Technologies Used

**MERN stack** - MongoDB, Express, React/Redux, and Node. 
 
 - For a reference to the **file structure format** this project is using, please look at the [Mern Starter](https://github.com/Hashnode/mern-starter).

 - This project does not use CSS Modules, styled-components, or other CSS-in-JS libraries, but uses Sass. [BEM guidelines and naming conventions](http://getbem.com/) are followed. 
 
 - For common and reusable styles, write OOSCSS (Object-Oriented SCSS) with placeholders and mixins. For organizing styles, follow the [7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) for Sass.

 - We're using [ES6](http://es6-features.org/) and transpiling to ES5 using [Babel](https://babeljs.io/). 

 - For reference to the JavaScript style guide, see the [Airbnb Style Guide](https://github.com/airbnb/javascript), [React ESLint Plugin](https://github.com/yannickcr/eslint-plugin-react).

 - The ESLint configuration is based on a few popular React/Redux boilerplates. Open to suggestions on this. If in development, you're getting annoyed with ESLint, you can temporarily remove the `eslint-loader` it from `webpack/config.dev.js` in the JavaScript loader, or disable any line from eslint by commenting at the end of the line `// eslint-disable-line`.

 - [Jest](https://jestjs.io/) for unit tests and snapshot testing along with [Enzyme](https://airbnb.io/enzyme/) for testing React.
