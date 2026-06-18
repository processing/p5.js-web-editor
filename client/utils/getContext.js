const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

export default function getContext(code, pos) {
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
      if (pos >= node.start && pos <= node.end) {
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
