import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const LOOP_TIMEOUT_MS = 100;

function isShaderCall(node) {
  const { callee } = node;
  const isBuildShader =
    callee.type === 'Identifier' && /^build\w*Shader$/.test(callee.name);
  const isBaseShaderModify =
    callee.type === 'MemberExpression' &&
    callee.property.name === 'modify' &&
    callee.object.type === 'CallExpression' &&
    callee.object.callee.type === 'Identifier' &&
    /^base\w*Shader$/.test(callee.object.callee.name);
  return isBuildShader || isBaseShaderModify;
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

export function jsPreprocess(jsText) {
  if (/\/\/\s*noprotect/.test(jsText)) {
    return jsText;
  }

  let ast;
  try {
    ast = acorn.parse(jsText, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      locations: true
    });
  } catch (e) {
    return jsText;
  }

  const shaderNames = collectShaderFunctionNames(ast);
  const loops = collectLoopsToProtect(ast, shaderNames);

  if (loops.length === 0) return jsText;

  const insertions = [];

  loops.forEach((loop) => {
    const { line } = loop.loc.start;
    const varName = `_LP${loop.start}`;

    const beforeCode = `var ${varName} = Date.now(); `;

    const checkCode =
      `if (Date.now() - ${varName} > ${LOOP_TIMEOUT_MS}) ` +
      `{ window.loopProtect.hit(${line}); break; } `;

    const { body } = loop;
    if (body.type === 'BlockStatement') {
      insertions.push({ pos: loop.start, code: beforeCode });
      insertions.push({ pos: body.start + 1, code: checkCode });
    } else {
      insertions.push({ pos: loop.start, code: beforeCode });
      insertions.push({ pos: body.start, code: `{ ${checkCode}` });
      insertions.push({ pos: body.end, code: ` }` });
    }
  });

  insertions.sort((a, b) => b.pos - a.pos);

  let result = jsText;
  insertions.forEach(({ pos, code }) => {
    result = result.slice(0, pos) + code + result.slice(pos);
  });

  return result;
}
