import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';

/**
 * @param {string} fileName
 * @return {string}
 */
export const getFileExtension = (fileName) =>
  fileName.match(/\.(\w+)$/)?.[1]?.toLowerCase();

/**
 * @param {string} fileExtension
 * @return {import('@codemirror/language').LanguageSupport | []}
 */
export const getLanguageSupport = (fileExtension) => {
  switch (fileExtension) {
    case 'js':
      return javascript({ jsx: false, typescript: false });
    case 'ts':
      return javascript({ jsx: false, typescript: true });
    case 'jsx':
      return javascript({ jsx: true, typescript: false });
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'css':
      return css();
    case 'html':
      return html(); // Note: has many options
    case 'json':
      return json();
    default:
      return [];
  }
};
