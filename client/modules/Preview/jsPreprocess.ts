import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import type { SimpleVisitors, AncestorVisitors } from 'acorn-walk';
import escodegen from 'escodegen';
import { hasNoProtect } from '../IDE/utils/loopProtection';

const LOOP_TIMEOUT_MS = 100;

interface LoopInfo {
  loop: acorn.ForStatement | acorn.WhileStatement | acorn.DoWhileStatement;
  parentBlock: acorn.BlockStatement | acorn.Program | null;
}

function isShaderCall(node: acorn.CallExpression): boolean {
  const { callee } = node;
  if (callee.type !== 'Identifier' && callee.type !== 'MemberExpression') {
    return false;
  }
  if (callee.type === 'Identifier') {
    return /^build\w*Shader$/.test(callee.name);
  }
  return (
    callee.property.type === 'Identifier' && callee.property.name === 'modify'
  );
}

function collectShaderFunctionNames(ast: acorn.Program): Set<string> {
  const names = new Set<string>();
  const visitors: SimpleVisitors<undefined> = {
    CallExpression(node: acorn.CallExpression) {
      if (isShaderCall(node)) {
        node.arguments.forEach((arg) => {
          if (arg.type === 'Identifier') {
            names.add(arg.name);
          }
        });
      }
    }
  };
  walk.simple(ast, visitors);
  return names;
}

function makeVarDecl(varName: string): acorn.VariableDeclaration {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [
      ({
        type: 'VariableDeclarator',
        id: ({
          type: 'Identifier',
          name: varName
        } as unknown) as acorn.Identifier,
        init: ({
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: ({
              type: 'Identifier',
              name: 'Date'
            } as unknown) as acorn.Expression,
            property: ({
              type: 'Identifier',
              name: 'now'
            } as unknown) as acorn.Identifier,
            computed: false
          },
          arguments: []
        } as unknown) as acorn.Expression
      } as unknown) as acorn.VariableDeclarator
    ],
    start: 0,
    end: 0
  };
}

function makeCheckStatement(varName: string, line: number): acorn.IfStatement {
  return {
    type: 'IfStatement',
    test: ({
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
    } as unknown) as acorn.BinaryExpression,
    consequent: ({
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
        { type: 'BreakStatement' }
      ]
    } as unknown) as acorn.BlockStatement,
    alternate: null,
    start: 0,
    end: 0
  };
}

function collectLoopsToProtect(
  ast: acorn.Program,
  shaderNames: Set<string>
): LoopInfo[] {
  const loops: LoopInfo[] = [];

  const visitors: AncestorVisitors<undefined> = {
    ForStatement(
      node: acorn.ForStatement,
      _state: undefined,
      ancestors: acorn.Node[]
    ) {
      collectLoop(node, ancestors, shaderNames, loops);
    },
    WhileStatement(
      node: acorn.WhileStatement,
      _state: undefined,
      ancestors: acorn.Node[]
    ) {
      collectLoop(node, ancestors, shaderNames, loops);
    },
    DoWhileStatement(
      node: acorn.DoWhileStatement,
      _state: undefined,
      ancestors: acorn.Node[]
    ) {
      collectLoop(node, ancestors, shaderNames, loops);
    }
  };

  walk.ancestor(ast, visitors);
  return loops;
}

function collectLoop(
  node: acorn.ForStatement | acorn.WhileStatement | acorn.DoWhileStatement,
  ancestors: acorn.Node[],
  shaderNames: Set<string>,
  loops: LoopInfo[]
): void {
  const isInsideShader = ancestors.some((ancestor, idx) => {
    if (ancestor.type === 'FunctionDeclaration') {
      const fn = ancestor as acorn.FunctionDeclaration;
      if (fn.id && shaderNames.has(fn.id.name)) {
        return true;
      }
    }
    if (
      ancestor.type === 'FunctionExpression' ||
      ancestor.type === 'ArrowFunctionExpression'
    ) {
      const parent = ancestors[idx - 1];
      if (parent?.type === 'CallExpression') {
        if (isShaderCall(parent as acorn.CallExpression)) {
          return true;
        }
      }
      if (parent?.type === 'VariableDeclarator') {
        const varId = (parent as acorn.VariableDeclarator).id;
        if (varId.type === 'Identifier' && shaderNames.has(varId.name)) {
          return true;
        }
      }
    }
    return false;
  });

  if (isInsideShader) return;

  let parentBlock: acorn.BlockStatement | acorn.Program | null = null;
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (
      ancestor !== node &&
      (ancestor.type === 'BlockStatement' || ancestor.type === 'Program')
    ) {
      parentBlock = ancestor as acorn.BlockStatement | acorn.Program;
      break;
    }
  }

  loops.push({ loop: node, parentBlock });
}

function injectProtection(loops: LoopInfo[]): void {
  loops.forEach((info, idx) => {
    const varName = `_LP${idx}`;
    const line = info.loop.loc?.start.line ?? 0;
    const check = makeCheckStatement(varName, line);

    if (info.loop.body.type === 'BlockStatement') {
      info.loop.body.body.unshift(check);
    } else {
      info.loop.body = ({
        type: 'BlockStatement',
        body: [check, info.loop.body]
      } as unknown) as acorn.Statement;
    }

    if (info.parentBlock) {
      const varDecl = makeVarDecl(varName);
      const nodeIdx = info.parentBlock.body.indexOf(
        (info.loop as unknown) as acorn.Statement
      );
      if (nodeIdx !== -1) {
        info.parentBlock.body.splice(nodeIdx, 0, varDecl);
      }
    }
  });
}

function parseJs(jsText: string): acorn.Program | null {
  const options = { ecmaVersion: 'latest' as const, locations: true };
  try {
    return acorn.parse(jsText, { ...options, sourceType: 'script' as const });
  } catch {
    try {
      return acorn.parse(jsText, { ...options, sourceType: 'module' as const });
    } catch {
      return null;
    }
  }
}

export function jsPreprocess(jsText: string, indexSrc: string): string {
  if (/\/\/\s*noprotect/.test(jsText)) {
    return jsText;
  }

  const ast = parseJs(jsText);
  if (!ast) return jsText;

  const shaderNames = collectShaderFunctionNames(ast);
  const loops = collectLoopsToProtect(ast, shaderNames);

  if (loops.length === 0) return jsText;

  injectProtection(loops);

  return escodegen.generate(ast);
}
