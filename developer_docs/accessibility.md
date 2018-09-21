## Accessibility Guidelines

Here is guide on [how to use the accessible editor](https://gist.github.com/MathuraMG/e86666b7b41fbc8c078bad9aff3f666d) and here is an overview of the [p5-accessibility.js](https://github.com/processing/p5.accessibility) library that makes p5.js sketches accessible to screen readers.

The code for the p5.js web editor adheres to web accessibility standards. The following guidelines will help to ensure that accessibility continues to be a priority as development continues.

**Code Structure**

* Screen Readers are an assistive technology for vision loss which helps users to navigate a web page. They are able to prioritize content based on the semantic meaning of HTML tags. Therefore, it is important to use specific tags, such as `nav`, `ul`, `li`, `section`, and so on. `div` is the least screen reader friendly tag. For example, [here is the semantic meaning of the `body` tag](http://html5doctor.com/element-index/#body)
* All buttons/links/windows need to be accessible by the keyboard ( By tabbing, pressing space etc.)
* In cases where tags are not screen reader friendly, we can take advantage of [tabIndex](http://webaim.org/techniques/keyboard/tabindex). Using tabIndex ensures that all elements are accessible via keyboard. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Editor.jsx#L249)
* When opening a new window or pop up window, ensure the keyboard focus also moves to the new window. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/NewFileForm.jsx#L16)

**Labeling**

* When creating button icons, images, or something without text (this does not include an HTML5 `<button>`), use [aria-labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute). [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/Toolbar.jsx#L67)
* All `<table>`s need to have a `summary` attribute. This will ensure user is given context to what the table is. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/modules/IDE/components/SketchList.jsx#L39)
* `ul`s and `nav`s menus need to include a title. [code example](https://github.com/processing/p5.js-web-editor/blob/master/client/components/Nav.jsx#L7)

For more information on accessibility see the [teach access tutorial](https://teachaccess.github.io/tutorial/)