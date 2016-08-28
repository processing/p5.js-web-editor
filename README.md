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
  ```
  Or, if you don't want to do that, just ask me to send you mine. Refer to [this gist](https://gist.github.com/catarak/70c9301f0fd1ac2d6b58de03f61997e3) for creating an S3 bucket for testing, or if you don't want to do that, I will send you my AWS credentials. 
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
  ```
  
  Or, if you don't want to do that, just ask me to send you mine. Refer to [this gist](https://gist.github.com/catarak/70c9301f0fd1ac2d6b58de03f61997e3) for creating an S3 bucket for testing, or if you don't want to do that, I will send you my AWS credentials. 
5. `$ npm run build`
6. `$ npm run start:prod`

###For Production Setup with PM2
1. `$ npm install -g pm2`
2. `$ pm2 start ecosystem.json`

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
