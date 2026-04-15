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

function collectLoopsToProtect(ast, shaderNames) {
  const loops = [];

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

    if (!isInsideShader) loops.push(node);
  }

  walk.ancestor(ast, {
    ForStatement: visitNode,
    WhileStatement: visitNode,
    DoWhileStatement: visitNode
  });

  return loops;
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

function injectProtection(loop, idx) {
  const varName = `_LP${idx}`;
  const { line } = loop.loc.start;
  const check = makeCheckStatement(varName, line);

  if (loop.body.type === 'BlockStatement') {
    loop.body.body.unshift(check);
  } else {
    loop.body = {
      type: 'BlockStatement',
      body: [check, loop.body]
    };
  }

  return makeVarDecl(varName);
}

function insertVarDeclsIntoBlock(blockBody, loopsWithVarDecls) {
  loopsWithVarDecls.forEach(({ loop, varDecl }) => {
    const idx = blockBody.indexOf(loop);
    if (idx !== -1) {
      blockBody.splice(idx, 0, varDecl);
    }
  });
}

function injectVarDeclsIntoAst(ast, loops) {
  const loopToVarDecl = new Map();
  loops.forEach((loop, idx) => {
    loopToVarDecl.set(loop, injectProtection(loop, idx));
  });

  walk.simple(ast, {
    BlockStatement(node) {
      const loopsWithVarDecls = node.body
        .filter((child) => loopToVarDecl.has(child))
        .map((loop) => ({ loop, varDecl: loopToVarDecl.get(loop) }));
      if (loopsWithVarDecls.length > 0) {
        insertVarDeclsIntoBlock(node.body, loopsWithVarDecls);
        loopsWithVarDecls.forEach(({ loop }) => loopToVarDecl.delete(loop));
      }
    },
    Program(node) {
      const loopsWithVarDecls = node.body
        .filter((child) => loopToVarDecl.has(child))
        .map((loop) => ({ loop, varDecl: loopToVarDecl.get(loop) }));
      if (loopsWithVarDecls.length > 0) {
        insertVarDeclsIntoBlock(node.body, loopsWithVarDecls);
        loopsWithVarDecls.forEach(({ loop }) => loopToVarDecl.delete(loop));
      }
    }
  });
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
  const loops = collectLoopsToProtect(ast, shaderNames);

  if (loops.length === 0) return jsText;

  injectVarDeclsIntoAst(ast, loops);

  return escodegen.generate(ast);
}
