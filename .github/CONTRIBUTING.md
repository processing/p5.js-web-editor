# Contributing to the p5.js Web Editor 

Hello! We welcome community contributions to the p5.js Web Editor. Contributing takes many forms and doesn't have to be **writing code**, it can be **report bugs**, **proposing new features**, **creating UI/UX designs**, and **updating documentation**. 

Here are links to all the sections in this document:

<!-- If you change any of the headings in this document, remember to update the table of contents. -->

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute ?](#how-can-i-contribute?)
  - [First Timers](#first-timers)
  - [Want something more challenging](#want-something-more-challenging)
  - [Feature Enhancement](#feature-enhancement)
- [Creating a Pull request](#creating-a-pull-request)
  - - [Tips](#tips)

# Code of Conduct

Please follow the guidelines mentioned at [CODE OF CONDUCT.md](https://github.com/processing/p5.js-web-editor/blob/master/CODE_OF_CONDUCT.md#p5js-code-of-conduct).

# How Can I Contribute?

### First Timers
For first-time contributors or those who want to start with a small task: [check out our list of good first bugs](https://github.com/processing/p5.js-web-editor/labels/good%20first%20issue). First read the github discussion on that issue and find out if there's currently a person working on that or not. If no one is working on it or if there has was one claimed to but has not been active for a while, ask if it is up for grabs. It's okay to not know how to fix an issue and feel free to ask questions about to approach the problem! We are all just here to learn and make something awesome. Someone from the community would help you out and these are great issues for learning about the web editor, its file structure and its development process.

### Want something more challenging
If you're already familiar with the project or would like take on something a little more challenging, please take a look at the [priority: high](https://github.com/processing/p5.js-web-editor/labels/priority%3Ahigh) issues.

### Feature Enhancement
If you want to work on building new things, please take a look at [type: feature](https://github.com/processing/p5.js-web-editor/labels/type%3Afeature).

If you'd like to work on a bug, please comment on it to let the maintainers know.
If someone else has already commented and taken up that bug, please refrain from working on it and submitting
a PR without asking the maintainers as it leads to unnecessary duplication of effort.

### Contribution guides

* [https://guides.github.com/activities/hello-world/](https://guides.github.com/activities/hello-world/)
* [https://guides.github.com/activities/forking/](https://guides.github.com/activities/forking/)

# Creating a pull request

Set up a new remote that points to the original project so that you can update your local repository once any changes have made to remote.
 
	$ git remote add upstream https://github.com/processing/p5.js-web-editor
 
 and also before you submit a [pull request](https://help.github.com/articles/creating-a-pull-request/), please remember to fetch the changes using:

	$ git fetch upstream

When you create a pull request for a new fix or feature, be sure to mention the issue number for what you're working on. The best way to do it is to mention the issue like this at the top of your description:

    Fixes #333

The issue number in this case is "333." The word *Fixes* is magical; GitHub will automatically close the issue when your pull request is merged.

# Writing commit messages

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

Tips
----

* If it seems difficult to summarize what your commit does, it may be because it includes several logical changes or bug fixes, and are better split up into several commits using `git add -p`.


