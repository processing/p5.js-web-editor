#p5.js Web Editor

This project is currently in the early stages of development! It will definitely be announced when it is in alpha/beta/etc.

##Development Installation

1. Clone this repostory and cd into it
2. `$ npm install`
3. Install MongoDB and make sure it is running
4. Create a file called `.env` in the root of this directory that looks like

  ```
  MONGO_URL=mongodb://localhost:27017/p5js-web-editor
  PORT=8000
  SESSION_SECRET=whatever_you_want_this_to_be_it_only_matters_for_production
  AWS_ACCESS_KEY=<your-aws-access-key>
  AWS_SECRET_KEY=<your-aws-secret-key>
  S3_BUCKET=<your-s3-bucket>
  GITHUB_ID=<your-github-client-id>
  GITHUB_SECRET=<your-github-client-secret>
  ```
   If you don't care about being able to upload media files to S3 or Login with Github, you can drop in the file exactly how it is. Or, if you don't want to do that, just ask me to send you mine. Refer to [this gist](https://gist.github.com/catarak/70c9301f0fd1ac2d6b58de03f61997e3) for creating an S3 bucket for testing, or if you don't want to do that, I can add you to one of my S3 buckets.
5. `$ npm start`
6. Navigate to [http://localhost:8000](http://localhost:8000) in your browser
7. Install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en).
8. Open and close the Redux DevTools using `ctrl+h`, and move them with `ctrl+w`

##Production Installation
1. Clone this repostory and `cd` into it
2. `$ npm install`
3. Install MongoDB and make sure it is running
4. Create a file called `.env` in the root of this directory that looks like

  ```
  MONGO_URL=mongodb://localhost:27017/p5js-web-editor
  PORT=8000
  SESSION_SECRET=make_this_a_long-random_string_like_maybe_126_characters_long
  AWS_ACCESS_KEY=<your-aws-access-key>
  AWS_SECRET_KEY=<your-aws-secret-key>
  S3_BUCKET=<your-s3-bucket>
  GITHUB_ID=<your-github-client-id>
  GITHUB_SECRET=<your-github-client-secret>
  ```

  For production, you will need to have real Github and Amazon credentions. Refer to [this gist](https://gist.github.com/catarak/70c9301f0fd1ac2d6b58de03f61997e3) for creating an S3 bucket for testing.
5. `$ npm run build`
6. `$ npm run start:prod`

###For Production Setup with PM2
1. `$ npm install -g pm2`
2. `$ pm2 start ecosystem.json`

##Accessibility Guidelines

The code for the p5.js web editor adheres to web accessibility standards. The following guidelines will help to ensure that accessibility continues to be a priority as development continues.

**Code Structure**

* Screen Readers are an assistive technology for vision loss which helps users to navigate a web page. They are able to prioritize content based on the semantic meaning of HTML tags. Therefore, it is important to use specific tags, such as `nav`, `ul`, `li`, `section`, and so on. `div` is the least screen reader friendly tag. For example, [here is the semantic meaning of the `body` tag](http://html5doctor.com/element-index/#body)
* All buttons/links/windows need to be accessible by the keyboard ( By tabbing, pressing space etc.)
* In cases where tags are not screen reader friendly, we can take advantage of [tabIndex](http://webaim.org/techniques/keyboard/tabindex). Using tabIndex ensures that all elements are accessible via keyboard. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Editor.js#L249)
* When opening a new window or pop up window, ensure the keyboard focus also moves to the new window. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/NewFileForm.js#L10)

**Labeling**

* When creating button icons, images, or something without text (this does not include an HTML5 `<button>`), use [aria-labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute). [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Toolbar.js#L60)
* All `<table>`s need to have a `summary` attribute. This will ensure user is given context to what the table is. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/SketchList.js#L27)
* `ul`s and `nav`s menus need to include a title. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/components/Nav.js#L7)

For more information on accessibility see the [teach access tutorial](https://teachaccess.github.io/tutorial/)

##Contribution Guide
I am currently open to contributors! Email me if you are looking for a task, or look at the open issues and reply that you are working on a task.

The p5.js Web Editor is built on a MERN stack - MongoDB, Express, React/Redux, and Node. For a reference to the file structure format I am using, please look at the [Mern Starter](https://github.com/Hashnode/mern-starter) and [this comment](https://github.com/Hashnode/mern-starter/issues/90#issuecomment-221553573).

This project does not use CSS Modules, but uses Sass. I like to follow [BEM rules](http://getbem.com/) for CSS naming conventions, write OOSCSS with placeholders and mixins, and follow the [7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) for Sass.

I'm using [ES6](http://es6-features.org/) and transpiling to ES5 using [Babel](https://babeljs.io/). For reference to the JavaScript style guide, see the [Airbnb Style Guide](https://github.com/airbnb/javascript), [React ESLint Plugin](https://github.com/yannickcr/eslint-plugin-react).

I'm new to using ESLint, but I decided on a configuration based on some popular React/Redux boilerplates. Open to suggestions on this. If in development, you're getting annoyed with ESLint, you can remove it from `webpack.config.dev.js` in the JavaScript loader, or disable any line from eslint by commenting at the end of the line `// eslint-disable-line`.

##Dump of links I'm saving for reference

* https://github.com/brigade/scss-lint
* https://github.com/petehunt/react-howto
* https://github.com/jsbin/jsbin (especially look at the console)
* Need to figure out how to solve the XSS issue, https://github.com/jsbin/jsbin/wiki/Best-practices-for-building-your-own-live-paste-bin
* https://www.npmjs.com/package/express-subdomain
* https://github.com/jsbin/jsbin/blob/master/public/js/render/console.js - the code is a little messy but it might be our only hope for a console
