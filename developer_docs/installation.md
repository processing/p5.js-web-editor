# Development Installation

Follow these instructions to set up your development environment, which you need to do before you start contributing code to this project.

## Manual Installation

_Note_: The installation steps assume you are using a Unix-like shell. If you are using Windows, you will need to use `copy` instead of `cp`.

1. Install Node.js. The recommended way is to Node through [nvm](https://github.com/nvm-sh/nvm). You can also install [node.js](https://nodejs.org/download/release/v12.16.1/) version 12.16.1 directly from the Node.js website.
2. [Fork](https://help.github.com/articles/fork-a-repo) the [p5.js Web Editor repository](https://github.com/processing/p5.js-web-editor) into your own GitHub account.
3. [Clone](https://help.github.com/articles/cloning-a-repository/) your new fork of the repository from GitHub onto your local computer.

   ```
   $ git clone https://github.com/YOUR_USERNAME/p5.js-web-editor.git
   ```

4. If you are using nvm, run `$ nvm use` to set your Node version to 12.16.1
5. Navigate into the project folder and install all its necessary dependencies with npm.

   ```
   $ cd p5.js-web-editor
   $ npm install
   ```
6. Install MongoDB and make sure it is running
   * For Mac OSX with [homebrew](http://brew.sh/): `brew tap mongodb/brew` then `brew install mongodb-community` and finally start the server with `brew services start mongodb-community` or you can visit the installation guide here [Installation Guide For MacOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   * For Windows and Linux: [MongoDB Installation](https://docs.mongodb.com/manual/installation/)
7. `$ cp .env.example .env`
8. (Optional) Update `.env` with necessary keys to enable certain app behaviors, i.e. add Github ID and Github Secret if you want to be able to log in with Github.
9. `$ npm run fetch-examples` - this downloads the example sketches into a user called 'p5'. Note that you need to configure your Github API, details can be found in the [Github API Configuration] section(https://github.com/vulongphan/p5.js-web-editor/blob/fix/installation-guide-update/developer_docs/installation.md#github-api-configuration)
10. `$ npm start`
11. Navigate to [http://localhost:8000](http://localhost:8000) in your browser
12. Install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
13. Open and close the Redux DevTools using `ctrl+h`, and move them with `ctrl+w`

## Docker Installation

_Note_: The installation steps assume you are using a Unix-like shell. If you are using Windows, you will need to use `copy` instead of `cp`.

Using Docker, you can have a complete, consistent development environment without having to manually install dependencies such as Node, Mongo, etc. It also helps isolate these dependencies and their data from other projects that you may have on the same computer that use different/conflicting versions, etc.

Note that this takes up a significant amount of space on your machine. Make sure you have at least 5GB free.

1. Install Docker for your operating system
   * Mac: https://www.docker.com/docker-mac
   * Windows: https://www.docker.com/docker-windows
2. Clone this repository and cd into it
3. `$ docker-compose -f docker-compose-development.yml build`
4. `$ cp .env.example .env`
5. (Optional) Update `.env` with necessary keys to enable certain app behavoirs, i.e. add Github ID and Github Secret if you want to be able to log in with Github.
6. `$ docker-compose -f docker-compose-development.yml run --rm app npm run fetch-examples` - note that you need to configure your Github API, details can be found in the [Github API Configuration] section(https://github.com/vulongphan/p5.js-web-editor/blob/fix/installation-guide-update/developer_docs/installation.md#github-api-configuration)

Now, anytime you wish to start the server with its dependencies, you can run:

7. `$ docker-compose -f docker-compose-development.yml up`
8. Navigate to [http://localhost:8000](http://localhost:8000) in your browser

To open a terminal/shell in the running Docker server (i.e. after `docker-compose up` has been run):

9. `$ docker-compose -f docker-compose-development.yml exec app bash -l`

If you don't have the full server environment running, you can launch a one-off container instance (and have it automatically deleted after you're done using it):

10. `$ docker-compose -f docker-compose-development.yml run app --rm bash -l`

## S3 Bucket Configuration

Note that this is optional, unless you are working on the part of the application that allows a user to upload images, videos, etc. Please refer to the following [gist](https://gist.github.com/catarak/70c9301f0fd1ac2d6b58de03f61997e3) to set up an S3 bucket to be used with this project.

If your S3 bucket is in the US East (N Virginia) region (us-east-1), you'll
need to set a custom URL base for it, because it does not follow the standard
naming pattern as the rest of the regions. Instead, add the following to your
environment/.env file, changing `BUCKET_NAME` to your bucket name. This is necessary because this override is currently treated as the full path to the bucket rather than as a proper base url:
`S3_BUCKET_URL_BASE=https://s3.amazonaws.com/{BUCKET_NAME}/`

If you've configured your S3 bucket and DNS records to use a custom domain
name, you can also set it using this variable. I.e.:

`S3_BUCKET_URL_BASE=https://files.mydomain.com`

For more information on using a custom domain, see this documentation link:

http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html#VirtualHostingCustomURLs

## Github API Configuration

In this application, Github Credentials are used for:
* Authentication with GitHub
* Importing the p5.js examples to your local database
* Rendering the 404 pages

If you are working on a part of the application that requires one of the above uses then you will need to get GitHub API credentials.

An overview about Github API can be found [here](https://developer.github.com/v3/).

When you go to your Developers Settings, you will see two types of Apps `Github Apps` and `OAuth Apps`. For this application, you should create an OAuth App since some Github API calls will not accept your Credentials if you create a Github App. One of the key differences between the two is that while `Oauth Apps` act on your behalf, `Github Apps` act on its own. More differences between these two can be found [here](https://docs.github.com/en/free-pro-team@latest/developers/apps/differences-between-github-apps-and-oauth-apps)

