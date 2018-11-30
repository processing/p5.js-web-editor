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

1. Push to `master` branch, or merge in a pull request to the `master` branch.
2. This triggers a build on [Travis CI](https://travis-ci.org/processing/p5.js-web-editor).
3. Travis CI builds a (development) Docker image of the whole application.
4. Travis CI runs some tests, which in this case, is just `npm run lint`. This could be updated in the future to include more extensive tests. If the tests fail, the build stops here.
5. If the tests pass, then Travis CI builds a (production) Docker image of the whole application.
6. This image is pushed to [Docker Hub](https://hub.docker.com/r/catarak/p5.js-web-editor/) with a unique tag name (the Travis commit) and also to the `latest` tag.
7. The Kubernetes deployment is updated to image just pushed to Docker Hub on the cluster on Google Kubernetes Engine. 

## Production Installation

You'll only need to do this if you're testing the production environment locally. 

1. Clone this repository and `cd` into it
2. `$ npm install`
3. Install MongoDB and make sure it is running
4. `$ cp .env.example .env`
5. (NOT Optional) edit `.env` and fill in all necessary values.
6. `$ npm run fetch-examples` - this downloads the example sketches into a user called 'p5'
7. `$ npm run build`
8. Since production assumes your environment variables are in the shell environment, and not in a `.env` file, you will have to run `export $(grep -v '^#' .env | xargs)` or a similar command, see this [Stack Overflow answer](https://stackoverflow.com/a/20909045/4086967).
9. `$ npm run start:prod`
