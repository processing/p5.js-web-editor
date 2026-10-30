import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { hasNoProtect } from '../IDE/utils/loopProtection';

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
  return `var ${varName} = Date.now(); `;
}

function makeCheckStatement(varName, line) {
  return `if (Date.now() - ${varName} > ${LOOP_TIMEOUT_MS}) { window.loopProtect.hit(${line}); break; }`;
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

    if (isInsideShader) return;

    let parentBlock = null;
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const ancestor = ancestors[i];
      if (
        ancestor !== node &&
        (ancestor.type === 'BlockStatement' || ancestor.type === 'Program')
      ) {
        parentBlock = ancestor;
        break;
      }
    }

    loops.push({ loop: node, parentBlock });
  }

  walk.ancestor(ast, {
    ForStatement: visitNode,
    WhileStatement: visitNode,
    DoWhileStatement: visitNode
  });

  return loops;
}

// Insert protection without changing the original line layout.
function injectProtection(jsText, loops) {
  const edits = [];

  loops.forEach(({ loop, parentBlock }, idx) => {
    const varName = `_LP${idx}`;
    const { line } = loop.loc.start;
    const check = makeCheckStatement(varName, line);

    if (loop.body.type === 'BlockStatement') {
      edits.push({ pos: loop.body.start + 1, rank: 1, text: ` ${check}` });
    } else {
      edits.push({ pos: loop.body.start, rank: 1, text: `{ ${check} ` });
      edits.push({ pos: loop.body.end, rank: 0, text: ' }' });
    }

    if (parentBlock && parentBlock.body.includes(loop)) {
      edits.push({ pos: loop.start, rank: 2, text: makeVarDecl(varName) });
    }
  });

  // Apply edits from the end so earlier offsets remain valid.
  edits.sort((a, b) => b.pos - a.pos || b.rank - a.rank);

  return edits.reduce(
    (result, { pos, text }) => result.slice(0, pos) + text + result.slice(pos),
    jsText
  );
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

export function jsPreprocess(jsText, indexSrc) {
  if (hasNoProtect(indexSrc)) {
    return jsText;
  }

  const ast = parseJs(jsText);
  if (!ast) return jsText;

  const shaderNames = collectShaderFunctionNames(ast);
  const loops = collectLoopsToProtect(ast, shaderNames);

  if (loops.length === 0) return jsText;

  return injectProtection(jsText, loops);
}
