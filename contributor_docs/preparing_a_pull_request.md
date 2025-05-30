# Preparing a Pull Request

Copied and updated from the [p5.js repository](https://github.com/processing/p5.js).

Pull-requests are easier when your code is up to date! 

## Before Submitting a Pull Request
Before submitting a pull request, make sure that:

- Your work is related to an issue. **Pull requests that do not have an associated issue will not be accepted.** 
- Your work adheres to the style guidelines and fits in with the rest of the codebase.
- You ran the project locally and tested your changes. Pay special attention to any specific areas of the p5.js editor that may be affected by your changes. Does everything still work as before? Great!

Once that's done, you can use git rebase to update your code to incorporate changes from other contributors. Here's how.

## Save and Update

### Save everything you have!
    git status
    git add -u
    git commit


### Find out about changes
Make sure you're tracking the upstream p5.js repository.

    git remote show upstream

If you see an error, you'll need to start tracking the main p5.js repo as an "upstream" remote repository. You'll only need to do this once! But, no harm is done if you run it a second time.

    git remote add upstream https://github.com/processing/p5.js-web-editor

Then ask git about the latest changes.

    git fetch upstream

### Just in case: make a copy of your changes in a new branch
    git branch your-branch-name-backup

### Apply changes from develop branch, adds your changes *after*
    git rebase upstream/develop

### Switches back to develop branch
    git checkout develop

### Helps other contributors fully understand the changes that you made
    git commit -m "Fixed documentation typos"   

### Verifies what git will be committing  
    git status       

## Pull Request Templates
Once you've opened your pull request, please ensure that you follow the guidelines and 

## CONFLICTS
You may have some conflicts! It's okay. Feel free to ask for help. If merging with the latest upstream `develop` branch causes conflicts, you can always make a pull request with the upstream repository, which makes the merge conflicts public.

## And finally, for the great glory
    git push --set-upstream origin your-branch-name-backup

Here's a [good tutorial reference on rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing), in case you're intensely curious about the technical details. 
