# Release

A guide for creating a release.

## Background
This project release guide is based on 
* [git-flow](https://nvie.com/posts/a-successful-git-branching-model/)
* [Semantic Versioning (semver)](https://semver.org/)
* [npm-version](https://docs.npmjs.com/cli/version)
* [Let's stop saying Master/Slave](https://medium.com/@mikebroberts/let-s-stop-saying-master-slave-10f1d1bf34df)

## Steps
1. `$ git checkout develop`
2. `$ git checkout -b release-<newversion>`
3. Do all of the release branch testing necessary. This could be as simple as running `npm test:ci`, or it could take user testing over a few days. 
4. `$ npm version <newversion>` (see [npm-version](https://docs.npmjs.com/cli/version) for valid values of <newversion>).
5. `$ git checkout release`
6. `$ git merge --no-ff release-<newversion>`
7. `$ git push && git push --tags`
8. `$ git checkout develop`
9.  Create a release on GitHub. Make sure that you release from the `release` branch! You can do this in one of two ways:
    1.  (Preferred) Use the [`hub` command line tool](https://hub.github.com/). You can automate adding all commit messages since the last release with the following command:
        ```sh
        $ hub release create -d -m "<newversion>" -m "$(git log `git describe --tags --abbrev=0 HEAD^`..HEAD --oneline)" <newversion>`
        ```
        Note that this creates a draft release, which you can then edit on GitHub. This allows you to create release notes from the list of commit messages, but then edit these notes as you wish.
    2.  [Draft a new release on Github](https://github.com/processing/p5.js-web-editor/releases/new).
10. `$ git merge --no-ff release-<newversion>`

Travis CI will automatically deploy the release to production, as well as push a production tagged Docker image to DockerHub.

