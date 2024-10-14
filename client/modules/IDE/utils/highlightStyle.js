import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const createHighlightStyle = (colors) =>
  HighlightStyle.define([
    { tag: tags.link, class: 'cm-link' },
    { tag: tags.heading, class: 'cm-heading' },
    { tag: tags.emphasis, class: 'cm-emphasis' },
    { tag: tags.strong, class: 'cm-strong' },
    { tag: tags.keyword, color: colors.keyword },
    { tag: tags.atom, color: colors.atom },
    { tag: tags.bool, class: 'cm-bool' },
    { tag: tags.url, class: 'cm-url' },
    { tag: tags.labelName, class: 'cm-labelName' },
    { tag: tags.inserted, class: 'cm-inserted' },
    { tag: tags.deleted, class: 'cm-deleted' },
    { tag: tags.literal, class: 'cm-literal' },
    { tag: tags.string, color: colors.string },
    { tag: tags.number, color: colors.number },
    {
      tag: [tags.regexp, tags.escape, tags.special(tags.string)],
      color: colors.regexp
    },
    { tag: tags.variableName, color: colors.variable },
    { tag: tags.local(tags.variableName), class: 'cm-variableName cm-local' },
    {
      tag: tags.definition(tags.variableName),
      class: 'cm-variableName cm-definition'
    },
    { tag: tags.special(tags.variableName), color: colors.specialVariable },
    {
      tag: tags.definition(tags.propertyName),
      class: 'cm-propertyName cm-definition'
    },
    { tag: tags.typeName, color: colors.typeName },
    { tag: tags.namespace, class: 'cm-namespace' },
    { tag: tags.className, class: 'cm-className' },
    { tag: tags.macroName, class: 'cm-macroName' },
    { tag: tags.propertyName, class: 'cm-propertyName' },
    { tag: tags.operator, color: colors.operator },
    { tag: tags.comment, color: colors.comment },
    { tag: tags.meta, class: 'cm-meta' },
    { tag: tags.invalid, class: 'cm-invalid' },
    { tag: tags.punctuation, class: 'cm-punctuation' },
    { tag: tags.special(tags.variableName), class: 'p5-variable' }
  ]);

export default createHighlightStyle;
