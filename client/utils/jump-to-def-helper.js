import * as parser from '@babel/parser';
import announceToScreenReader from './ScreenReaderHelper';

const traverse = require('@babel/traverse').default;

export function getScriptLoadOrder(files) {
  const indexHtmlFile = files.find((f) => f.name.endsWith('index.html'));
  if (!indexHtmlFile) return [];

  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/g;
  const scripts = [];
  let match = scriptRegex.exec(indexHtmlFile.content);
  while (match !== null) {
    scripts.push(match[1]);
    match = scriptRegex.exec(indexHtmlFile.content);
  }

  return scripts;
}

export function buildProjectSymbolTable(files, scriptOrder) {
  const symbolTable = {};

  scriptOrder.forEach((scriptName) => {
    const file = files.find((f) => f.name.endsWith(scriptName));
    if (!file) return;

    let ast;
    try {
      ast = parser.parse(file.content, {
        sourceType: 'script',
        plugins: ['jsx', 'typescript']
      });
    } catch (e) {
      return;
    }

    traverse(ast, {
      FunctionDeclaration(path) {
        const name = path.node.id?.name;
        if (name && !symbolTable[name]) {
          symbolTable[name] = {
            file: file.name,
            pos: path.node.start
          };
        }
      },
      VariableDeclarator(path) {
        const name = path.node.id?.name;
        if (name && !symbolTable[name]) {
          symbolTable[name] = {
            file: file.name,
            pos: path.node.start
          };
        }
      }
    });
  });

  return symbolTable;
}

export function announceJump(cm, fromPos, toPos, varName) {
  cm.setCursor(toPos);
  cm.focus();
  announceToScreenReader(
    `Jumped to line ${toPos.line + 1} at definition of ${varName}`
  );
}
