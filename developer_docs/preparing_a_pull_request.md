# Preparing a pull request

Copied and updated from the [p5.js repository](https://github.com/processing/p5.js).

Pull-requests are easier when your code is up to date! You can use git rebase to update your code to incorporate changes from other contributors. Here's how.

## Save and Update

### Save everything you have!
    git status
    git add -u
    git commit


### Find out about changes
Make sure you're tracking upstream p5.js repository.

    git remote show upstream

If you see an error, you'll need to start tracking the main p5.js repo as an "upstream" remote repository. You'll only need to do this once! But, no harm is done if you run it a second time.

    git remote add upstream https://github.com/processing/p5.js-web-editor

Then ask git about the latest changes.

    git fetch upstream

### Just in case: make a copy of your changes in a new branch
    git branch your-branch-name-backup

### Apply changes from master branch, adds your changes *after*
    git rebase upstream/master

### Switches back to master branch
    git checkout master

### Helps other contributors fully understand the changes that you made
    git commit -m "Fixed documentation typos"   

### Verifies what git will be committing  
    git status       

## CONFLICTS
You may have some conflicts! It's okay. Feel free to ask for help. If merging with the latest upstream master causes conflicts, you can always make a pull request with the upstream repository, which makes the merge conflicts public.

## And finally, for great glory
    git push --set-upstream origin your-branch-name-backup

Here's a good reference on rebasing, in case you're intensely curious about the technical details. https://www.atlassian.com/git/tutorials/merging-vs-rebasing
