import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import escodegen from 'escodegen';

const LOOP_TIMEOUT_MS = 100;

function isShaderCall(node) {
  const { callee } = node;
  const isBuildShader =
    callee.type === 'Identifier' && /^build\w*Shader$/.test(callee.name);
  const isModifyCall =
    callee.type === 'MemberExpression' && callee.property.name === 'modify';
  return isBuildShader || isModifyCall;
}

function collectShaderFunctionNames(ast) {
  const names = new Set();
  walk.simple(ast, {
    CallExpression(node) {
      if (isShaderCall(node)) {
        node.arguments.forEach((arg) => {
          if (arg.type === 'Identifier') {
            names.add(arg.name);
          }
        });
      }
    }
  });
  return names;
}

function makeVarDecl(varName) {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: varName },
        init: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Date' },
            property: { type: 'Identifier', name: 'now' },
            computed: false
          },
          arguments: []
        }
      }
    ]
  };
}

function makeCheckStatement(varName, line) {
  return {
    type: 'IfStatement',
    test: {
      type: 'BinaryExpression',
      operator: '>',
      left: {
        type: 'BinaryExpression',
        operator: '-',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Date' },
            property: { type: 'Identifier', name: 'now' },
            computed: false
          },
          arguments: []
        },
        right: { type: 'Identifier', name: varName }
      },
      right: {
        type: 'Literal',
        value: LOOP_TIMEOUT_MS,
        raw: String(LOOP_TIMEOUT_MS)
      }
    },
    consequent: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'window' },
                property: { type: 'Identifier', name: 'loopProtect' },
                computed: false
              },
              property: { type: 'Identifier', name: 'hit' },
              computed: false
            },
            arguments: [{ type: 'Literal', value: line, raw: String(line) }]
          }
        },
        { type: 'BreakStatement', label: null }
      ]
    },
    alternate: null
  };
}

function protectLoops(ast, shaderNames) {
  let loopCount = 0;

  function visitNode(node, ancestors) {
    const isInsideShader = ancestors.some((ancestor, idx) => {
      if (
        ancestor.type === 'FunctionDeclaration' &&
        shaderNames.has(ancestor.id?.name)
      ) {
        return true;
      }
      if (
        ancestor.type === 'FunctionExpression' ||
        ancestor.type === 'ArrowFunctionExpression'
      ) {
        const parent = ancestors[idx - 1];
        if (
          parent?.type === 'CallExpression' &&
          isShaderCall(parent) &&
          parent.arguments.includes(ancestor)
        ) {
          return true;
        }
        if (
          parent?.type === 'VariableDeclarator' &&
          shaderNames.has(parent.id?.name)
        ) {
          return true;
        }
      }
      return false;
    });

    if (isInsideShader) return;

    const varName = `_LP${loopCount++}`;
    const { line } = node.loc.start;
    const check = makeCheckStatement(varName, line);

    if (node.body.type === 'BlockStatement') {
      node.body.body.unshift(check);
    } else {
      node.body = { type: 'BlockStatement', body: [check, node.body] };
    }

    const varDecl = makeVarDecl(varName);
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const ancestor = ancestors[i];
      if (
        ancestor !== node &&
        (ancestor.type === 'BlockStatement' || ancestor.type === 'Program')
      ) {
        const nodeIdx = ancestor.body.indexOf(node);
        if (nodeIdx !== -1) {
          ancestor.body.splice(nodeIdx, 0, varDecl);
          break;
        }
      }
    }
  }

  walk.ancestor(ast, {
    ForStatement: visitNode,
    WhileStatement: visitNode,
    DoWhileStatement: visitNode
  });

  return loopCount;
}

function parseJs(jsText) {
  const options = { ecmaVersion: 'latest', locations: true };
  try {
    return acorn.parse(jsText, { ...options, sourceType: 'script' });
  } catch (e) {
    try {
      return acorn.parse(jsText, { ...options, sourceType: 'module' });
    } catch (e2) {
      return null;
    }
  }
}

export function jsPreprocess(jsText) {
  if (/\/\/\s*noprotect/.test(jsText)) {
    return jsText;
  }

  const ast = parseJs(jsText);
  if (!ast) return jsText;

  const shaderNames = collectShaderFunctionNames(ast);
  const loopCount = protectLoops(ast, shaderNames);

  if (loopCount === 0) return jsText;

  return escodegen.generate(ast);
}
