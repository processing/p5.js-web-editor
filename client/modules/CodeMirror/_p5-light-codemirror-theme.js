import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import rootTheme, { colors, grays, remSize, Theme } from '../../theme';

const pink = '#D52889';
const blue = '#0B7CA9';

const themeVars = rootTheme[Theme.light];

export const mixedHighlightStyle = HighlightStyle.define([
  { tag: tags.link, class: 'cm-link' },
  { tag: tags.heading, class: 'cm-heading' },
  { tag: tags.emphasis, class: 'cm-emphasis' },
  { tag: tags.strong, class: 'cm-strong' },
  { tag: tags.keyword, color: '#7A5A3A' },
  { tag: tags.atom, color: pink },
  { tag: tags.bool, class: 'cm-bool' },
  { tag: tags.url, class: 'cm-url' },
  { tag: tags.labelName, class: 'cm-labelName' },
  { tag: tags.inserted, class: 'cm-inserted' },
  { tag: tags.deleted, class: 'cm-deleted' },
  { tag: tags.literal, class: 'cm-literal' },
  { tag: tags.string, color: '#47820A' },
  { tag: tags.number, color: grays.dark },
  {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: '#A06801'
  },
  { tag: tags.variableName, color: blue },
  { tag: tags.local(tags.variableName), class: 'cm-variableName cm-local' },
  {
    tag: tags.definition(tags.variableName),
    class: 'cm-variableName cm-definition'
  },
  { tag: tags.special(tags.variableName), color: grays.dark },
  {
    tag: tags.definition(tags.propertyName),
    class: 'cm-propertyName cm-definition'
  },
  { tag: tags.typeName, color: pink },
  { tag: tags.namespace, class: 'cm-namespace' },
  { tag: tags.className, class: 'cm-className' },
  { tag: tags.macroName, class: 'cm-macroName' },
  { tag: tags.propertyName, class: 'cm-propertyName' },
  { tag: tags.operator, color: '#7A5A3A' },
  { tag: tags.comment, color: grays.middleGray },
  { tag: tags.meta, class: 'cm-meta' },
  { tag: tags.invalid, class: 'cm-invalid' },
  { tag: tags.punctuation, class: 'cm-punctuation' },
  { tag: tags.special(tags.variableName), class: 'p5-variable' }
]);

const p5LightCodemirrorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: grays.lighter,
      color: grays.dark,
      fontFamily: 'Inconsolata, monospace',
      height: '100%'
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-gutters': {
      //  background-color: getThemifyVariable('editor-gutter-color');
      //     border-color: getThemifyVariable('ide-border-color');
      // width: remSize(48),
      width: '2.7em'
    },
    '.cm-lineNumbers': {
      paddingRight: remSize(10),
      '& .cm-gutterElement': {
        width: remSize(32),
        left: remSize(-3), // !important
        color: themeVars.inactiveTextColor
      }
    },
    '.cm-line': {
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      wordBreak: 'normal'
    },
    '.cm-content': {
      maxWidth: 'calc(100% - 2.7em)' // TODO
    },
    // copied from previous
    '.tok-definition': {
      color: blue
    },
    '.tok-propertyName': {
      color: grays.dark
    },
    '.cm-linenumber': {
      color: '#b5b5b5'
    },
    '.CodeMirror-selected': {
      backgroundColor: 'rgba(45, 123, 182, 25)'
    },
    '.cm-activeLine': {
      backgroundColor: grays.light
    },
    '.cm-activeLineGutter': {
      backgroundColor: grays.light,
      borderRight: `1px solid ${grays.mediumLight}`
    },
    '.cm-error': {
      color: colors.red
    },
    '.cm-matchingBracket': {
      outline: `1px solid ${grays.mediumDark}`,
      outlineOffset: '1px',
      color: `${grays.dark} !important`
    },
    '.cm-qualifier': {
      color: blue
    },
    '.cm-tag': {
      color: pink
    },
    '.cm-builtin': {
      color: blue
    },
    '.cm-attribute': {
      color: grays.dark
    },
    '.cm-p5-function': {
      color: blue,
      fontWeight: 'bold'
    },
    '.cm-p5-variable': {
      color: pink
    },
    '.cm-foldPlaceholder': {
      backgroundColor: grays.dark,
      color: colors.white
    },
    '.CodeMirror-cursor': {
      borderLeft: `1px solid ${grays.dark}`
    },
    '.cm-searchMatch': {
      backgroundColor: `${colors.p5jsPink}80`
    },
    '.CodeMirror-selectedtext': {
      backgroundColor: grays.mediumLight
    }
  },
  { dark: false }
);

export default p5LightCodemirrorTheme;
