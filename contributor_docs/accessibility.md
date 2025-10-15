## Accessibility Guidelines

Here is a guide on [how to use the accessible editor](https://gist.github.com/MathuraMG/e86666b7b41fbc8c078bad9aff3f666d) and here is an overview of the [p5-accessibility.js](https://github.com/processing/p5.accessibility) library that makes p5.js sketches accessible to screen readers.

The code for the p5.js web editor adheres to web accessibility standards. The following guidelines will help to ensure that accessibility continues to be a priority as development continues.

## Screen Reader and Keyboard Access
**Code Structure**

* Screen Readers are an assistive technology for vision loss that helps users to navigate a web page. They are able to prioritize content based on the semantic meaning of HTML tags. Therefore, it is important to use specific tags, such as `nav`, `ul`, `li`, `section`, and so on. `div` is the least screen reader-friendly tag. For example, [here is the semantic meaning of the `body` tag](http://html5doctor.com/element-index/#body)
* All buttons/links/windows need to be accessible by the keyboard ( By tabbing, pressing space etc.)
* In cases where tags are not screen reader-friendly, we can take advantage of [tabIndex](http://webaim.org/techniques/keyboard/tabindex). Using tabIndex ensures that all elements are accessible via keyboard. [code example](https://github.com/processing/p5.js-web-editor/blob/edae248eede21d7ad7702945929efbcdfeb4d9ea/client/modules/IDE/components/Sidebar.jsx#L88)
* When opening a new window or pop up window, ensure the keyboard focus also moves to the new window. [code example](https://github.com/processing/p5.js-web-editor/blob/edae248eede21d7ad7702945929efbcdfeb4d9ea/client/modules/IDE/components/NewFileForm.jsx#L32)

**Labeling**

* When creating button icons, images, or something without text (this does not include an HTML5 `<button>`), use [aria-labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label). [code example](https://github.com/processing/p5.js-web-editor/blob/edae248eede21d7ad7702945929efbcdfeb4d9ea/client/modules/IDE/components/Toolbar.jsx#L107)
* All `<table>`s need to have a `summary` attribute. This will ensure user is given context to what the table is. [code example](https://github.com/processing/p5.js-web-editor/blob/edae248eede21d7ad7702945929efbcdfeb4d9ea/client/modules/IDE/components/SketchList.jsx#L491)
* `ul`s and `nav`s menus need to include a title. [code example](https://github.com/processing/p5.js-web-editor/blob/edae248eede21d7ad7702945929efbcdfeb4d9ea/client/components/Nav.jsx#L281)


## Color Blind and Low-Vision Accessibility

To make the editor accessible to color blind and low-vision users, it is important to adhere to the [WCAG 2.2 accessibility guidelines](https://www.w3.org/TR/WCAG22/) relating to adequate color contrast and the use of color to convey information.

**Contrast**

* The [WCAG 2.2 accessibility guidelines](https://www.w3.org/TR/WCAG22/) include guidelines [1.4.3: Perceivable - Contrast (minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum) and [1.4.11: Perceivable - Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast). The guideline for contrast is to ensure that color blind and low-vision users are able to visually distinguish elements that are different colors from one another.

* These guidelines specify the AA standard of contrast ratios between the foreground and background of different types of text, images, and UI components.

    * Small text (above 14pt and below 18pt and not bold) must have a contrast ratio of at least 4.5:1
    * [Large text](https://www.w3.org/TR/WCAG22/#dfn-large-scale) (above 18 pt regular/14 pt bold or roughly 1.2-1.5em) must have a contrast ratio of at least 3:1
    * UI components must have a contrast ratio of at least 3:1 against all adjacent colors
    * The color marking the state of UI components (ie active vs inactive) must have a contrast ratio of at least 3:1 relative to each other
    * Graphics that are required for understanding content must have a contrast ratio of at least 3:1 against all adjacent colors
    * Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement.
    * Text that is part of a logo or brand name has no contrast requirement.

* The [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) tool by TPGi is a downloadable app that allows you to check color contrast and see if it complies with requirements for small text, large text, and GUI elements.

* It is recommended that you adhere to the codelens color palettes (light, dark, and contrast)  when contributing to the p5 editor, which define different colors for different parts of the GUI. These colors can be found in client/styles/components/abstracts/variables.scss. Many components come with color defaults that use theme-wide color styles. Some color combinations within the palettes meet foreground/background contrast requirements and others do not, so it is important to check them.
* A p5 editor contributor [(Izzy Snyder)]([url](https://github.com/Izzy-Snyder)) created a tool to check which colors in the editor palette do and do not comply with contrast standards. You can [check out the Github Repository]([url](https://github.com/Izzy-Snyder/contrast-palette-checker)) to try it out yourself.

**Use of Color**
* The [WCAG 2.2 accessibility guidelines](https://www.w3.org/TR/WCAG22/) include [guideline 1.4.1 - perceivable: use of color](https://www.w3.org/TR/WCAG22/#use-of-color). This guideline states that “Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.” 
* Essentially, information that the user needs to be aware of such as the presence of links, the state of buttons, and the presence of errors should not be communicated through color (hue) differences alone. Additionally, the user must not be expected to correctly identify a specific color to use the site (e.g saying “errors are marked in red”).
* This does not mean color cannot be used to convey information - that is great design practice! However, that information should also be conveyed in an additional way. 
* Ways to convey information include: 
    * [using text labels in addition to color](https://www.w3.org/WAI/WCAG22/Techniques/general/G14)
    * [using additional non-color styling cues](https://www.w3.org/WAI/WCAG22/Techniques/general/G182) such as underlining or bolding text to differentiate links from surrounding text
    * [using different fill patterns](https://www.w3.org/WAI/WCAG22/Techniques/general/G111) to differentiate GUI elements
    *[using appropriate contrast](https://www.w3.org/WAI/WCAG22/Techniques/general/G183) (meaning differences in lightness/darkness instead of just hue) between differently colored elements. 
* Using styling that is completely unrelated to color is often the most straightforward way to meet this guideline, compared to color contrast which requires more attention to detail on a per-component basis to implement and maintain.

## Accessible web design resources
* For more information on accessibility see the [teach access tutorial](https://teachaccess.github.io/tutorial/)
* [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref)
* [Checklist - The A11Y Project](https://www.a11yproject.com/checklist/) - a basic accessibility checklist based on the WCAG 2.2 guidelines
* [Resources - The A11Y Project](https://www.a11yproject.com/resources/) - resource library including articles, tools, and classes on accessible web design.
* [Deque University](https://dequeuniversity.com/) - classes and articles on accessible design
* [Color accessibility beyond a pass/fail by Lauren Jong](https://medium.com/san-francisco-digital-services/color-accessibility-beyond-a-pass-fail-2ea19be4b3c1) - a more nuanced case study on designing for accessibility with regard to color
