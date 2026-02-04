# Style Guide

Currently in progress. 

---
Additional Resources: 
- [Zeplin File with Official Colors](google.com/url?q=https://github.com/processing/p5.js-web-editor/wiki/Color-Combinations-for-Accessibility&sa=D&source=docs&ust=1769528946688435&usg=AOvVaw2626esAvAi1JMEjarRcDcT)
- [Accessible Links Color Combinations](https://scene.zeplin.io/project/55f746c54a02e1e50e0632c3)

Tips when making styling contributions: 
- Define color specifications and other design tokens as CSS custom properties (e.g. `--var(primary-color)`) instead of hard coded values like HEX, RGB ..etc.
- Ensure your changes only affect what you intend. For example, review what uses a variable before modifying it to avoid unintended changes. 
- Before creating a new CSS, check for utility classes and variables that provide styling you need. 