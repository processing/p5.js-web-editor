# p5.js Web Editor

This project is currently in development! It will be announced when there is a (public) beta release.

## Development Installation

1. Fork this repository.
2. Clone the forked repository and cd into it
3. `$ npm install`
4. Install MongoDB and make sure it is running
   * For Mac OSX with [homebrew](http://brew.sh/): `brew install mongodb` then `brew services start mongodb`
   * For Windows and Linux: [MongoDB Installation](https://docs.mongodb.com/manual/installation/)
5. `$ cp .env.example .env`
6. (Optional) Update `.env` with necessary keys to enable certain app behavoirs, i.e. add Github ID and Github Secret if you want to be able to log in with Github.
7. `$ npm run fetch-examples` - this downloads the example sketches into a user called 'p5'
8. `$ npm start`
9. Navigate to [http://localhost:8000](http://localhost:8000) in your browser
10. Install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
11. Open and close the Redux DevTools using `ctrl+h`, and move them with `ctrl+w`

### Testing SSL on your local machine
Please refer to [this gist](https://gist.github.com/andrewn/953ffd5cb17ac2634dc969fc7bdaff3f). This allows you to access the editor using both HTTP and HTTPS. Don't worry about this unless you need to make changes or test HTTPS behavior.

The automatic redirection to HTTPS is turned off by default in development. If you need to test this behavior, put `FORCE_TO_HTTPS=true` in your `.env` file.

## Development Installation using Docker

Using Docker, you can have a complete, consistent development environment without having to manually install dependencies such as Node, Mongo, etc. It also helps isolate these dependencies and their data from other projects that you may have on the same computer that use different/conflicting versions, etc.

Note that this takes up a significant amount of space on your machine. Make sure you have at least 5GB free.

1. Install Docker for your operating system
   * Mac: https://www.docker.com/docker-mac
   * Windows: https://www.docker.com/docker-windows
2. Clone this repository and cd into it
3. `$ docker-compose -f docker-compose-development.yml build`
4. `$ docker-compose -f docker-compose-development.yml run --rm server npm run fetch-examples`

Now, anytime you wish to start the server with its dependencies, you can run:

5. `$ docker-compose -f docker-compose-development.yml up`
6. Navigate to [http://localhost:8000](http://localhost:8000) in your browser

To open a terminal/shell in the running Docker server (i.e. after `docker-compose up` has been run):

7. `$ docker-compose -f docker-compose-development.yml exec server bash -l`

If you don't have the full server environment running, you can launch a one-off container instance (and have it automatically deleted after you're done using it):

8. `$ docker-compose -f docker-compose-development.yml run server --rm bash -l`

## Production Installation
1. Clone this repository and `cd` into it
2. `$ npm install`
3. Install MongoDB and make sure it is running
4. `$ cp .env.example .env`
5. (NOT Optional) edit `.env` and fill in all necessart values.
6. `$ npm run fetch-examples` - this downloads the example sketches into a user called 'p5'
7. `$ npm run build`
8. `$ npm run start:prod`

### For Production Setup with PM2
1. `$ npm install -g pm2`
2. `$ pm2 start ecosystem.json`

## S3 Bucket Configuration

Please refer to the folllowing [gist](https://gist.github.com/catarak/70c9301f0fd1ac2d6b58de03f61997e3) to set up an S3 bucket to be used with this project.


If your S3 bucket is in the US East (N Virginia) region (us-east-1), you'll
need to set a custom URL base for it, because it does not follow the standard
naming pattern as the rest of the regions. Instead, add the following to your
environment/.env file:

`S3_BUCKET_URL_BASE=https://s3.amazonaws.com`

If you've configured your S3 bucket and DNS records to use a custom domain
name, you can also set it using this variable. I.e.:

`S3_BUCKET_URL_BASE=https://files.mydomain.com`

For more information on using a custom domain, see this documentation link:

http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html#VirtualHostingCustomURLs

## Accessibility Guidelines

Here is guide on [how to use the accessible editor](https://gist.github.com/MathuraMG/e86666b7b41fbc8c078bad9aff3f666d) and here is an overview of the [p5-accessibility.js](https://github.com/processing/p5.accessibility) library that makes p5.js sketches accessible to screen readers.

The code for the p5.js web editor adheres to web accessibility standards. The following guidelines will help to ensure that accessibility continues to be a priority as development continues.

**Code Structure**

* Screen Readers are an assistive technology for vision loss which helps users to navigate a web page. They are able to prioritize content based on the semantic meaning of HTML tags. Therefore, it is important to use specific tags, such as `nav`, `ul`, `li`, `section`, and so on. `div` is the least screen reader friendly tag. For example, [here is the semantic meaning of the `body` tag](http://html5doctor.com/element-index/#body)
* All buttons/links/windows need to be accessible by the keyboard ( By tabbing, pressing space etc.)
* In cases where tags are not screen reader friendly, we can take advantage of [tabIndex](http://webaim.org/techniques/keyboard/tabindex). Using tabIndex ensures that all elements are accessible via keyboard. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Editor.jsx#L249)
* When opening a new window or pop up window, ensure the keyboard focus also moves to the new window. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/NewFileForm.jsx#L16)

**Labeling**

* When creating button icons, images, or something without text (this does not include an HTML5 `<button>`), use [aria-labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute). [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Toolbar.jsx#L67)
* All `<table>`s need to have a `summary` attribute. This will ensure user is given context to what the table is. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/SketchList.jsx#L39)
* `ul`s and `nav`s menus need to include a title. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/components/Nav.jsx#L7)

For more information on accessibility see the [teach access tutorial](https://teachaccess.github.io/tutorial/)

## Contributing

See [CONTRIBUTING.md](https://github.com/processing/p5.js-web-editor/blob/master/contributing.md).

## Tooling and Style Overview

The p5.js Web Editor is built on a MERN stack - MongoDB, Express, React/Redux, and Node. For a reference to the file structure format I am using, please look at the [Mern Starter](https://github.com/Hashnode/mern-starter) and [this comment](https://github.com/Hashnode/mern-starter/issues/90#issuecomment-221553573).

This project uses an in-development [p5-accessibility.js library](https://github.com/processing/p5.accessibility) for accessibility.

This project does not use CSS Modules, but uses Sass. I like to follow [BEM rules](http://getbem.com/) for CSS naming conventions, write OOSCSS with placeholders and mixins, and follow the [7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) for Sass.

I'm using [ES6](http://es6-features.org/) and transpiling to ES5 using [Babel](https://babeljs.io/). For reference to the JavaScript style guide, see the [Airbnb Style Guide](https://github.com/airbnb/javascript), [React ESLint Plugin](https://github.com/yannickcr/eslint-plugin-react).

The ESLint configuration is based on a few popular React/Redux boilerplates. Open to suggestions on this. If in development, you're getting annoyed with ESLint, you can remove it from `webpack.config.dev.js` in the JavaScript loader, or disable any line from eslint by commenting at the end of the line `// eslint-disable-line`.

## AWS information
This project is currently hosted on an EC2 instance and uses S3 for media hosting.

Backups on the MongoDB are also hosted on an S3 bucket, based on the following [gist](https://gist.github.com/eladnava/96bd9771cd2e01fb4427230563991c8d). The backup script runs nightly via a cronjob at 8AM UTC/3AM EST/12AM PST. Backups are deleted after 30 days.
