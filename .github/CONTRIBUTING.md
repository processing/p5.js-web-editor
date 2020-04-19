# Contributing to the p5.js Web Editor 

Hello! We welcome community contributions to the p5.js Web Editor. Contributing takes many forms and doesn't have to be **writing code**, it can be **reporting bugs**, **proposing new features**, **creating UI/UX designs**, and **updating documentation**.

## Table of Contents
- [Contributing to the p5.js Web Editor](#contributing-to-the-p5js-web-editor)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [How Can I Contribute?](#how-can-i-contribute)
    - [First Steps](#first-steps)
    - [Good First Issues](#good-first-issues)
    - [Good Medium Issues](#good-medium-issues)
    - [Project Board](#project-board)
    - [Project Ideas](#project-ideas)
    - [Issue Search and Tagging](#issue-search-and-tagging)
    - [Beginning Work](#beginning-work)
    - [Contribution Guides](#contribution-guides)
  - [Writing Commit Messages](#writing-commit-messages)
  - [Tips](#tips)

## Code of Conduct

Please follow the guidelines in the [Code of Conduct](https://github.com/processing/p5.js-web-editor/blob/master/.github/CODE_OF_CONDUCT.md).

## How Can I Contribute?
If you're new to open source, [read about how to contribute to open source](https://opensource.guide/how-to-contribute/).

### First Steps
Don't know where to begin? Here are some suggestions to get started:
* Think about what you're hoping to learn by working on open source. The web editor is a full-stack web application, therefore there's tons of different areas to focus on:
  - UI/UX design
  - Project management: Organizing tickets, pull requests, tasks
  - Front end: React/Redux, CSS/Sass, CodeMirror
  - Back end: Node, Express, MongoDB, Jest, AWS
  - DevOps: Travis CI, Jest, Docker, Kubernetes, AWS
  - Documentation
  - Translations: Application and documentation
* Use the [p5.js Web Editor](https://editor.p5js.org)! Find a bug? Think of something you think would add to the project? Open an issue.
* Expand an existing issue. Sometimes issues are missing steps to reproduce, or need suggestions for potential solutions. Sometimes they need another voice saying, "this is really important!"
* Try getting the project running locally on your computer by following the [installation steps](./../developer_docs/installation.md).
* Look through the documentation in the [developer docs](../developer_docs/). Is there anything that could be expanded? Is there anything missing?
* Look at the [development guide](./../developer_docs/development.md).

### Good First Issues
For first-time contributors or those who want to start with a small task, [check out the list of good first issues](https://github.com/processing/p5.js-web-editor/labels/good%20first%20issue), or [issues that need documentation of steps to reproduce](https://github.com/processing/p5.js-web-editor/issues?q=is%3Aissue+is%3Aopen+label%3A%22needs+steps+to+reproduce%22). If the issue has not been assigned to anyone, then you can work on it! It's okay to not know how to fix an issue, and feel free to ask questions about to approach the problem! We are all here to learn and make something awesome. Someone from the community would help you out and these are great issues for learning about the web editor, its file structure and its development process.

### Good Medium Issues
If you're looking for a bigger project to take on, look through the issues tagged [good medium issue](https://github.com/processing/p5.js-web-editor/labels/good%20medium%20issue). These issues are self-contained projects that may take longer to work on, but are great if you're looking to get more deeply involved in contributing!

### Project Board
Many issues are related to each other and fall under bigger projects. To get a bigger picture, look at the [All Projects](https://github.com/processing/p5.js-web-editor/projects/4) board.

### Project Ideas
If you're looking for inspiration for Google Summer of Code or a bigger project, there's a [project list](https://github.com/processing/processing/wiki/Project-List#p5js-web-editor) maintained on the Processing wiki.

### Issue Search and Tagging
If you're looking for issues to work on, a good place to start is with tickets labeled [high priority](https://github.com/processing/p5.js-web-editor/labels/priority%3Ahigh). You can also look for tickets that are [feature enhancements](https://github.com/processing/p5.js-web-editor/labels/type%3Afeature), [bug fixes](https://github.com/processing/p5.js-web-editor/labels/type%3Abug), and a few other tags. 

If you feel like an issue is tagged incorrectly (e.g. it's low priority and you think it should be high), please update the issue!

### Beginning Work

If you'd like to work on an issue, please comment on it to let the maintainers know, so that they can assign it to you. If someone else has already commented and taken up that issue, please refrain from working on it and submitting a PR without asking the maintainers as it leads to unnecessary duplication of effort.

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