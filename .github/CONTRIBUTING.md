# Contributing to the p5.js Web Editor 

Hello! We welcome community contributions to the p5.js Web Editor. Contributing takes many forms and doesn't have to be **writing code**, it can be **report bugs**, **proposing new features**, **creating UI/UX designs**, and **updating documentation**.

Here are links to all the sections in this document:

<!-- If you change any of the headings in this document, remember to update the table of contents. -->

- [Contributing to the p5.js Web Editor](#contributing-to-the-p5js-web-editor)
  - [Code of Conduct](#code-of-conduct)
  - [How Can I Contribute?](#how-can-i-contribute)
    - [First Timers](#first-timers)
    - [Milestones](#milestones)
    - [Project Ideas](#project-ideas)
    - [Issue Search and Tagging](#issue-search-and-tagging)
    - [Beginning Work](#beginning-work)
    - [Contribution Guides](#contribution-guides)
  - [Writing Commit Messages](#writing-commit-messages)
  - [Tips](#tips)

## Code of Conduct

Please follow the guidelines mentioned at [CODE OF CONDUCT.md](https://github.com/processing/p5.js-web-editor/blob/master/.github/CODE_OF_CONDUCT.md).

## How Can I Contribute?

### First Timers
For first-time contributors or those who want to start with a small task: [check out our list of good first bugs](https://github.com/processing/p5.js-web-editor/labels/good%20first%20issue). First read the github discussion on that issue and find out if there's currently a person working on that or not. If no one is working on it or if there has was one claimed to but has not been active for a while, ask if it is up for grabs. It's okay to not know how to fix an issue and feel free to ask questions about to approach the problem! We are all just here to learn and make something awesome. Someone from the community would help you out and these are great issues for learning about the web editor, its file structure and its development process.

### Milestones
A good place to check for tickets to work on is [milestones](https://github.com/processing/p5.js-web-editor/milestones), as miletones have a due date, and will give you a sense of tickets the tickets that maintainers would like to be completed sooner rather than later.

### Project Ideas
If you're looking for inspiration for Google Summer of Code or a bigger project, there's a [project list](https://github.com/processing/processing/wiki/Project-List#p5js-web-editor) maintained on the Processing wiki.

### Issue Search and Tagging
If you're looking for issues to work on, a good place to start is with tickets labeled [high priority](https://github.com/processing/p5.js-web-editor/labels/priority%3Ahigh). You can also look for tickets that are [feature enhancements](https://github.com/processing/p5.js-web-editor/labels/type%3Afeature), [bug fixes](https://github.com/processing/p5.js-web-editor/labels/type%3Abug), and a few other tags. 

If you feel like an issue is tagged incorrectly (e.g. it's low priority and you think it should be high), please update the issue!

### Beginning Work

If you'd like to work on an issue, please comment on it to let the maintainers know. If someone else has already commented and taken up that issue, please refrain from working on it and submitting a PR without asking the maintainers as it leads to unnecessary duplication of effort.

Then, follow the [installation guide](https://github.com/processing/p5.js-web-editor/blob/master/developer_docs/installation.md) to get the project building and working on your computer. 

### Contribution Guides

* [https://guides.github.com/activities/hello-world/](https://guides.github.com/activities/hello-world/)
* [https://guides.github.com/activities/forking/](https://guides.github.com/activities/forking/)

## Writing Commit Messages

Good commit messages serve at least three important purposes:

* They speed up the reviewing process.
* They help us write good release notes.
* They help future maintainers understand your change and the reasons behind it.

Structure your commit message like this:

 ```
 Short (50 chars or less) summary of changes ( involving Fixes #Issue-number keyword )

 More detailed explanatory text, if necessary. Wrap it to about 72
 characters or so. In some contexts, the first line is treated as the
 subject of an email and the rest of the text as the body. The blank
 line separating the summary from the body is critical (unless you omit
 the body entirely); tools like rebase can get confused if you run the
 two together.

 Further paragraphs come after blank lines.

   - Bullet points are okay, too

   - Typically a hyphen or asterisk is used for the bullet, preceded by a
     single space, with blank lines in between, but conventions vary here
 ```

* Write the summary line and description of what you have done in the imperative mode, that is as if you were commanding someone. Start the line with "Fix", "Add", "Change" instead of "Fixed", "Added", "Changed".
* Always leave the second line blank.
* Be as descriptive as possible in the description. It helps reasoning about the intention of commits and gives more context about why changes happened.

## Tips

* If it seems difficult to summarize what your commit does, it may be because it includes several logical changes or bug fixes, and are better split up into several commits using `git add -p`.