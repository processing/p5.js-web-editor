const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

export default function getContext(_cm) {
  const code = _cm.getValue();
  const cursor = _cm.getCursor();
  const offset = _cm.indexFromPos(cursor);

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    return 'global';
  }

  let context = 'global';

  traverse(ast, {
    Function(path) {
      const { node } = path;
      if (offset >= node.start && offset <= node.end) {
        if (node.id && node.id.name) {
          context = node.id.name;
        } else {
          const parent = path.parentPath.node;
          if (
            parent.type === 'VariableDeclarator' &&
            parent.id.type === 'Identifier'
          ) {
            context = parent.id.name;
          } else {
            context = '(anonymous)';
          }
        }
        path.stop();
      }
    }
  });

  return context;
}
