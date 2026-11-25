/**
 * @jest-environment jsdom
 */
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { p5JavaScript } from './p5JavaScript';

const doc = [
  'ellipse(0, 0, 10);',
  'curveVertex(0, 0);',
  'smoothstep(0, 1, 0.5);',
  'colorMode(OKLCH);',
  'let x = mouseX;',
  'myFunction();'
].join('\n');

function getHighlighted(p5Version) {
  const parent = document.createElement('div');
  document.body.appendChild(parent);
  const view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: [p5JavaScript(p5Version)]
    }),
    parent
  });
  const functions = [...parent.querySelectorAll('.cm-p5-function')].map(
    (el) => el.textContent
  );
  const variables = [...parent.querySelectorAll('.cm-p5-variable')].map(
    (el) => el.textContent
  );
  view.destroy();
  parent.remove();
  return { functions, variables };
}

describe('p5JavaScript syntax highlighting', () => {
  it('highlights p5.js v1 keywords for a v1 sketch', () => {
    const { functions, variables } = getHighlighted('1.11.13');
    expect(functions).toEqual(['ellipse', 'curveVertex', 'colorMode']);
    expect(variables).toEqual(['mouseX']);
  });

  it('highlights p5.js v2 keywords for a v2 sketch', () => {
    const { functions, variables } = getHighlighted('2.0.5');
    expect(functions).toEqual(['ellipse', 'smoothstep', 'colorMode']);
    expect(variables).toEqual(['OKLCH', 'mouseX']);
  });

  it('falls back to v1 keywords when the version is unknown', () => {
    const { functions } = getHighlighted(undefined);
    expect(functions).toEqual(['ellipse', 'curveVertex', 'colorMode']);
  });
});
