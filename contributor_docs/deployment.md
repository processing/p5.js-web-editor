# Deployment

This document contains information about how to deploy to production, all of the different platforms and tools, and how to configure them.

WIP.
* Production Setup/Installation
* Travis
* Docker Hub
* Kubernetes
* S3
* Mailgun
* Cloudflare
* DNS/Dreamhost
* mLab

## Deployment Process

These are the steps that happen when you deploy the application.

1. Push to `develop` branch, or merge in a pull request to the `develop` branch.
2. This triggers a build on [Travis CI](https://travis-ci.org/processing/p5.js-web-editor).
3. Travis CI builds a (development) Docker image of the whole application.
4. Travis CI runs some tests, which in this case, is just `npm run lint`. This could be updated in the future to include more extensive tests. If the tests fail, the build stops here.
5. If the tests pass, then Travis CI builds a (production) Docker image of the whole application.
6. This image is pushed to [Docker Hub](https://hub.docker.com/r/catarak/p5.js-web-editor/) with a unique tag name (the Travis commit) and also to the `latest` tag.
7. The Kubernetes deployment is updated to image just pushed to Docker Hub on the cluster on Google Kubernetes Engine.

## Production Installation

You'll only need to do this if you're testing the production environment locally.

_Note_: The installation steps assume you are using a Unix-like shell. If you are using Windows, you will need to use `copy` instead of `cp`.

1. Clone this repository and `cd` into it
2. `$ npm install`
3. Install MongoDB and make sure it is running
4. `$ cp .env.example .env`
5. (NOT Optional) edit `.env` and fill in all necessary values.
6. `$ npm run fetch-examples` - this downloads the example sketches into a user called 'p5'
7. `$ npm run build`
8. Since production assumes your environment variables are in the shell environment, and not in a `.env` file, you will have to run `export $(grep -v '^#' .env | xargs)` or a similar command, see this [Stack Overflow answer](https://stackoverflow.com/a/20909045/4086967).
9. `$ npm run start:prod`

## Self Hosting - Heroku Deployment

If you are interested in hosting and deploying your own p5.js Web Editor instance, you can! It would be the same as the official editor instance at editor.p5js.org, except with a different domain, and you would be in charge of the maintenance. We recommend using Heroku as you can host it for free.

1. Sign up for a free account at: [Heroku](https://www.heroku.com/)
2. Click here: [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/processing/p5.js-web-editor/tree/develop)
3. Enter a unique *App name*, this will become part of the url (i.e. https://app-name.herokuapp.com/)
4. Update any configuration variables, or accept the defaults for a quick evaluation (they can be changed later to enable full functionality)
5. Click on the "Deploy app" button
6. When complete, click on the "View app" button
