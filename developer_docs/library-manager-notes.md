# Library Manager Notes

- Backwards Compatibility
- index.html file is not guaranteed to be there ([#1070](https://github.com/processing/p5.js-web-editor/issues/1070))
- changing a user editable file programmatically
- how to keep library manager libraries in sync with index.html (using data attribute??)
- versioning of libraries
- dom parsing, is this inefficient? move preview frame utils to separate file?
- prettifying—the dom parser messes up the format
- libraries to include
  - p5 libraries
  - ml5
  - Tone
- prevent duplicate addition of libraries
  - should libraries be an object instead of an array????
  