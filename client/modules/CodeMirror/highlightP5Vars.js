import { syntaxTree } from '@codemirror/language';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType
} from '@codemirror/view';

import {
  p5FunctionKeywords,
  p5VariableKeywords
} from '../../utils/p5-keywords';

class P5StyleWidget extends WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }

  eq(other) {
    return this.text === other.text;
  }

  toDOM(view) {
    const wrap = document.createElement('span');
    wrap.className = 'p5-styled';
    wrap.innerText = this.text;
    const source = document.createElement('a');
    source.href = `https://p5js.org/reference/#/p5/${this.text}`;
    source.innerText = 'doc';
    source.target = '_blank';
    wrap.append(source);
    return wrap;
  }
}

class P5ReferenceLink extends WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }

  eq(other) {
    return this.text === other.text;
  }

  toDOM(view) {
    const link = document.createElement('a');
    link.href = `https://p5js.org/reference/#/p5/${this.text}`;
    link.innerText = '*';
    link.target = '_blank';
    return link;
  }
}

function createDecorations(view) {
  const widgets = [];
  const marks = [];
  const decorations = [];
  view.visibleRanges.forEach(({ from, to }) => {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        const text = view.state.doc.sliceString(node.from, node.to);
        // console.log(node.name, text, node);
        if (node.name === 'CallExpression/VariableName') {
          console.log('!!!!!');
        }
        // Note: VariableDefinition is for setup/draw/etc
        if (
          node.name === 'VariableName' ||
          node.name === 'VariableDefinition'
        ) {
          if (text in p5FunctionKeywords) {
            const mark = Decoration.mark({
              class: 'p5-function'
            });
            decorations.push(mark.range(node.from, node.to));
            const deco = Decoration.widget({
              widget: new P5ReferenceLink(text),
              side: 1
            });
            decorations.push(deco.range(node.to));
          } else if (text in p5VariableKeywords) {
            const mark = Decoration.mark({
              class: 'p5-variable'
            });
            decorations.push(mark.range(node.from, node.to));
            const deco = Decoration.widget({
              widget: new P5ReferenceLink(text),
              side: 1
            });
            decorations.push(deco.range(node.to));
          }
        }
      }
    });
  });
  return Decoration.set(decorations);
}

const p5StylePlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.placeholders = createDecorations(view);
    }
    update(viewUpdate) {
      if (viewUpdate.docChanged || viewUpdate.viewportChanged) {
        this.placeholders = createDecorations(viewUpdate.view);
      }
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of(
        (view) => view.plugin(plugin)?.placeholders || Decoration.none
      ),
    eventHandlers: {}
  }
);

export default p5StylePlugin;
