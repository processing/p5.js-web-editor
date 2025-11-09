const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

export function isGlobalReference(
  varName,
  context,
  scopeToDeclaredVarsMap,
  userDefinedClassMetadata,
  baseClassContext,
  isBaseThis
) {
  const globalVars = scopeToDeclaredVarsMap.global || {};
  if (!Object.prototype.hasOwnProperty.call(globalVars, varName)) {
    return false;
  }

  const localVars = scopeToDeclaredVarsMap[context] || {};
  if (
    !(context === 'global') &&
    Object.prototype.hasOwnProperty.call(localVars, varName)
  ) {
    return false;
  }

  if (baseClassContext) {
    const className = context;
    let methodName = null;
    if (baseClassContext && baseClassContext.includes('.')) {
      methodName = baseClassContext.split('.').pop();
    }
    const classMeta = userDefinedClassMetadata[className];
    if (classMeta) {
      if (
        methodName === 'constructor' &&
        classMeta.constructor_params?.includes(varName)
      ) {
        return false;
      }

      if (
        methodName &&
        classMeta.methodVars?.[methodName] &&
        Object.prototype.hasOwnProperty.call(
          classMeta.methodVars[methodName],
          varName
        )
      ) {
        return false;
      }

      if (classMeta.fields?.includes(varName) && isBaseThis) {
        return false;
      }
    }
  }

  return true;
}

export function isThisReference(cm, ast, fromPos, oldName) {
  const offset = cm.indexFromPos(fromPos);
  let isThisRef = false;

  traverse(ast, {
    MemberExpression(path) {
      const { node } = path;
      if (!node.loc) return;

      if (offset >= node.start && offset <= node.end) {
        if (
          node.object.type === 'ThisExpression' &&
          node.property.type === 'Identifier' &&
          node.property.name === oldName &&
          !node.computed
        ) {
          isThisRef = true;
          path.stop();
        }
      }
    }
  });

  return isThisRef;
}

export function getContext(
  cm,
  ast,
  fromPos,
  scopeToDeclaredVarsMap,
  userDefinedClassMetadata
) {
  const offset = cm.indexFromPos(fromPos);
  let context = 'global';

  traverse(ast, {
    enter(path) {
      const { node } = path;
      if (!node.loc) return;
      if (offset < node.start || offset > node.end) {
        return;
      }

      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression'
      ) {
        const inBody =
          node.body && offset >= node.body.start && offset <= node.body.end;
        const inParams = node.params?.some(
          (p) => offset >= p.start && offset <= p.end
        );

        if (inBody || inParams) {
          if (node.id?.name) {
            context = node.id.name;
          } else {
            const parent = path.parentPath?.node;
            if (
              parent?.type === 'VariableDeclarator' &&
              parent.id?.type === 'Identifier'
            ) {
              context = parent.id.name;
            } else {
              context = '(anonymous)';
            }
          }
          path.skip();
        }
      }

      if (
        (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') &&
        offset >= node.start &&
        offset <= node.end
      ) {
        context = node.id?.name || '(anonymous class)';
        path.skip();
      }
    }
  });

  return context;
}

export function getAST(cm) {
  const code = cm.getValue();

  try {
    return parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    return null;
  }
}

export function getClassContext(cm, ast, fromPos) {
  const offset = cm.indexFromPos(fromPos);
  let classContext = null;

  traverse(ast, {
    enter(path) {
      const { node } = path;
      if (!node.loc) return;
      if (offset < node.start || offset > node.end) return;

      if (
        (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') &&
        offset >= node.start &&
        offset <= node.end
      ) {
        const className = node.id?.name || '(anonymous class)';
        classContext = className;

        const methodPath = path
          .get('body.body')
          .find(
            (p) =>
              (p.node.type === 'ClassMethod' ||
                p.node.type === 'ClassPrivateMethod') &&
              offset >= p.node.start &&
              offset <= p.node.end
          );

        if (methodPath) {
          let methodName;
          if (methodPath.node.kind === 'constructor') {
            methodName = 'constructor';
          } else if (methodPath.node.key.type === 'Identifier') {
            methodName = methodPath.node.key.name;
          } else if (methodPath.node.key.type === 'StringLiteral') {
            methodName = methodPath.node.key.value;
          } else {
            methodName = '(anonymous method)';
          }

          classContext = `${className}.${methodName}`;
        }

        path.skip();
      }
    }
  });

  return classContext;
}
