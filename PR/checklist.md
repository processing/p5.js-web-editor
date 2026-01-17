# PR Preparation Checklist

- [ ] Verify the issue exists, is assigned to you, and is referenced in the PR.
- [ ] Ensure your local branch is up to date: `git fetch upstream` + `git rebase upstream/develop`.
- [ ] Backup branch if needed: `git branch <branch>-backup`.
- [ ] Run relevant tests and manual checks for affected areas of the editor.
- [ ] Stage and commit changes: `git status`, `git add -u`, `git commit`.
- [ ] Confirm clean status before pushing.
- [ ] Push to your fork: `git push --set-upstream origin <branch-name>`.
- [ ] Fill out the PR description (summary, testing, issue link) and follow repository templates.
- [ ] Be prepared to resolve merge conflicts or ask for help if they arise. 
