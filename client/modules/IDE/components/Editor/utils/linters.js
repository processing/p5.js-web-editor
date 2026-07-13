import { jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { HTMLHint } from 'htmlhint';
import { CSSLint } from 'csslint';
import { esLint } from '@codemirror/lang-javascript';
import { Linter as ESLinter } from 'eslint-linter-browserify';

// https://github.com/codemirror/codemirror5/blob/master/addon/lint/html-lint.js
const HTMLHINT_OPTIONS = {
  'tagname-lowercase': true,
  'attr-lowercase': true,
  'attr-value-double-quotes': true,
  'doctype-first': false,
  'tag-pair': true,
  'spec-char-escape': true,
  'id-unique': true,
  'src-not-empty': true,
  'attr-no-duplication': true
};

const ESLINT_CONFIG = {
  languageOptions: {
    ecmaVersion: 2021
  },
  rules: {
    semi: 'off',
    eqeqeq: 'off'
  }
};

const eslint = new ESLinter();

export function makeJavascriptLinter() {
  return linter(esLint(eslint, ESLINT_CONFIG));
}

export function makeCssLinter(callback) {
  return (view) => {
    const documentContent = view.state.doc.toString();
    const { messages } = CSSLint.verify(documentContent, {});
    const diagnostics = [];

    messages.forEach((message) => {
      if (!message) return;

      const {
        line: messageLine,
        col: messageCharacter,
        type: messageType,
        message: messageText
      } = message;
      const cmLine = view.state.doc.line(messageLine);

      const start = cmLine.from + messageCharacter - 1;
      const end = cmLine.to;

      diagnostics.push({
        from: start,
        to: end,
        severity: messageType,
        message: messageText
      });
    });

    if (callback) callback(diagnostics);
    return diagnostics;
  };
}

export function makeHtmlLinter(callback) {
  return (view) => {
    const documentContent = view.state.doc.toString();
    const messages = HTMLHint.verify(documentContent, HTMLHINT_OPTIONS) || [];
    const diagnostics = [];

    messages.forEach((message) => {
      if (!message) return;

      const {
        line: messageLine,
        col: messageCharacter,
        type: messageType,
        message: messageText
      } = message;
      const cmLine = view.state.doc.line(messageLine);

      // TODO: Can we to do the to/from smarter?
      diagnostics.push({
        from: cmLine.from + messageCharacter - 1,
        to: cmLine.from + messageCharacter,
        severity: messageType,
        message: messageText
      });
    });

    if (callback) callback(diagnostics);
    return diagnostics;
  };
}

export function makeJsonLinter(callback) {
  const baseJsonLinter = jsonParseLinter();
  return (view) => {
    const diagnostics = baseJsonLinter(view);
    if (callback) callback(diagnostics);
    return diagnostics;
  };
}
