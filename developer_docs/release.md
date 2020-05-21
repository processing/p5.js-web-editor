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
4. `$ git checkout release`
5. `$ git merge --no-ff release-<newversion>`
6. `$ npm version <newversion>` (see [npm-version](https://docs.npmjs.com/cli/version) for valid values of <newversion>).
7. `$ git push && git push --tags`
8. `$ git checkout develop`
9. `$ git merge --no-ff release-<newversion>`

Travis CI will automatically deploy the release to production, as well as push a production tagged Docker image to DockerHub.

