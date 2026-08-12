# Release

A guide for deploying a release to the production environment.

## Background

This project's release guide is based on:

- [git-flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Semantic Versioning (semver)](https://semver.org/)
- [npm-version](https://docs.npmjs.com/cli/version)
- [Let's stop saying Master/Slave](https://medium.com/@mikebroberts/let-s-stop-saying-master-slave-10f1d1bf34df)

## Steps for a standard release:

### via GHA:

1. An issue titled "Weekly release - DATE" will be created every Tuesday at 15:30 UTC. Go to the [Issues tab](https://github.com/processing/p5.js-web-editor/issues) and click the link in the description to the [Create a release](../.github/workflows/release.yml) GitHub Actions workflow.
2. Run the **Create a release** workflow via "Run workflow".
3. Enter the version to release: either an explicit semver (e.g. `2.22.0`) or an [npm version](https://docs.npmjs.com/cli/version) keyword (`patch`, `minor`, `major`, etc).
4. Wait for the workflow to run the `verify` job, which tests the checked out code in `develop`. If tests fail, the workflow will stop & record its result as a failure. Devs should fix any test failures, then attempt the [Create a release](../.github/workflows/release.yml) workflow again.
5. If the tests succeed, the workflow will wait on maintainer approval for the `draft-release` job. Go to [Staging](https://stagingeditor.p5js.org) and perform any manual checks. If all looks good, approve the `release` job. This does steps 5-12 below which results in merging the cut release into `release`; merging `release` into `develop`; and a new draft GitHub release with auto-generated notes & version & tags.
6. [Review the drafted release](https://github.com/processing/p5.js-web-editor/releases) and click **Publish release** when ready. This will then trigger the deployment to [Production](editor.p5js.org).

### Manually:

1. `$ git checkout develop`
2. `$ git pull origin develop`
3. `$ git checkout -b release-<newversion>`
4. Do all of the release branch testing necessary. This could be as simple as running `npm test:ci`, or it could take user testing over a few days.
5. `$ npm version <newversion>` (see [npm-version](https://docs.npmjs.com/cli/version) for valid values of <newversion>).
6. `$ git checkout release`
7. `$ git merge --no-ff release-<newversion>`
8. `$ git push && git push --tags`
9. `$ git checkout develop`
10. `$ git merge --no-ff release-<newversion>`
11. `$ git push origin develop`
12. [Draft a new release on Github](https://github.com/processing/p5.js-web-editor/releases/new). Choose the tag that is the release version you just created, and then title it `v<newversion>`. Then click "Generate release notes". Publish the release and you are finished!

GHA will automatically deploy the release to production, as well as push a production tagged Docker image to DockerHub.

## Steps for a Patch Release

Sometimes you might need to push a release for an isolated and small bug fix without what's currently been merged into the `develop` branch. The steps for pushing a Patch Release are similar to a standard Release, except you work with the `release` branch as opposed to `develop`.

This process is not yet automated by the Actions workflow above, so it's still done by hand.

1. `$ git checkout release`
2. `$ git pull origin release`
3. `$ git checkout -b release-<newversion>` (increment patch version)
4. Do all of the release branch testing necessary. This could be as simple as running `npm test:ci`, or it could take user testing over a few days.
5. `$ npm version <newversion>` (see [npm-version](https://docs.npmjs.com/cli/version) for valid values of )(npm version patch).
6. `$ git checkout release`
7. `$ git merge --no-ff release-<newversion>`
8. `$ git push && git push --tags`
9. `$ git checkout develop`
10. `$ git merge --no-ff release-<newversion>`
11. `$ git push origin develop`
12. [Draft a new release on Github](https://github.com/processing/p5.js-web-editor/releases/new). Choose the tag that is the release version you just created, and then title it `v<newversion>`. Then click "Generate release notes". Publish the release and you are finished!

### What if the PR Bug Fix is branched from `develop`?

1. Make a copy of the branch locally: `gh pr checkout ##`
2. `git checkout release`
3. `git pull origin release`
4. `git checkout -b <descriptive-branch-name>`
5. `git cherry-pick <every sha in PR branch>`
6. Make a new PR that merges into `release` (has a base branch `release`)
7. Done!
