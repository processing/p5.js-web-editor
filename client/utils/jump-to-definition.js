/* eslint-disable */
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import * as parser from '@babel/parser';
import { getContext, getAST } from './renameVariableHelper';
import { selectFiles } from '../modules/IDE/selectors/files';
import { setSelectedFile } from '../modules/IDE/actions/ide';
import announceToScreenReader from './ScreenReaderHelper';
import {
  getScriptLoadOrder,
  buildProjectSymbolTable,
  announceJump
} from './jump-to-def-helper';
import store from '../index';

const traverse = require('@babel/traverse').default;

export function jumpToDefinition(pos) {
  const state = store.getState();
  const files = selectFiles(state);

  const cm = this._cm;
  const token = cm.getTokenAt(pos);
  const tokenType = token.type;
  const varName = token.string;

  if (!tokenType || tokenType === 'def') {
    announceToScreenReader(`Already at definition of ${varName}`);
    return;
  }

  const ast = getAST(cm);
  const { scopeToDeclaredVarsMap = {}, userDefinedFunctionMetadata = {} } =
    p5CodeAstAnalyzer(cm) || {};

  const currentContext = getContext(cm, ast, pos, scopeToDeclaredVarsMap);
  const isUserFunction = !!userDefinedFunctionMetadata[varName];
  const isDeclaredVar =
    scopeToDeclaredVarsMap[currentContext]?.[varName] !== undefined;

  let found = false;

  // search project-wide definitions (script load order)
  if (!found) {
    const scriptOrder = getScriptLoadOrder(files);

    if (scriptOrder.length) {
      const projectSymbolTable =
        buildProjectSymbolTable(files, scriptOrder) || {};
      const globalSymbol = projectSymbolTable[varName];

      if (globalSymbol) {
        for (let i = scriptOrder.length - 1; i >= 0; i--) {
          const scriptName = scriptOrder[i];
          const file = files.find((f) => f.name.endsWith(scriptName));
          if (!file) continue;

          let ast;
          try {
            ast = parser.parse(file.content, {
              sourceType: 'script',
              plugins: ['jsx', 'typescript']
            });
          } catch {
            continue;
          }

          let foundInThisFile = false;
          traverse(ast, {
            FunctionDeclaration(path) {
              if (path.node.id?.name === varName) {
                const targetFileObj = file;

                const fileContent = targetFileObj.content;
                const beforeText = fileContent.slice(0, path.node.start);
                const line = beforeText.split('\n').length - 1;
                const ch = beforeText.split('\n').pop().length;

                store.dispatch(setSelectedFile(targetFileObj.id));
                pos = { line, ch };
                cm.setCursor(pos);

                announceToScreenReader(
                  `Jumped to definition of ${varName} in ${file.name}`
                );
                foundInThisFile = true;
                path.stop();
              }
            },
            VariableDeclarator(path) {
              if (path.node.id?.name === varName) {
                const targetFileObj = file;

                const fileContent = targetFileObj.content;
                const beforeText = fileContent.slice(0, path.node.start);
                const line = beforeText.split('\n').length - 1;
                const ch = beforeText.split('\n').pop().length;

                store.dispatch(setSelectedFile(targetFileObj.id));
                pos = { line, ch };
                cm.setCursor(pos);

                announceToScreenReader(
                  `Jumped to definition of ${varName} in ${file.name}`
                );
                foundInThisFile = true;
                path.stop();
              }
            }
          });

          if (foundInThisFile) break;
        }
      }
    }
  }

  // Search in current file, same context
  traverse(ast, {
    VariableDeclarator(path) {
      if (found) return;

      const { node } = path;
      if (node.id.name === varName && node.loc) {
        const defPos = cm.posFromIndex(node.start);
        const defContext = getContext(cm, ast, defPos, scopeToDeclaredVarsMap);
        if (defContext === currentContext) {
          found = true;
          announceJump(cm, pos, defPos, varName);
        }
      }
    },

    FunctionDeclaration(path) {
      if (found) return;

      const { node } = path;

      if (node.id?.name === varName) {
        const defPos = cm.posFromIndex(node.start);
        const defContext = getContext(cm, ast, defPos, scopeToDeclaredVarsMap);
        if (defContext === currentContext) {
          found = true;
          announceJump(cm, pos, defPos, varName);
        }
      }

      if (!node.params || !node.loc) return;
      for (const param of node.params) {
        if (param.name === varName && param.loc) {
          const defPos = cm.posFromIndex(param.start);
          const defContext = getContext(
            cm,
            ast,
            defPos,
            scopeToDeclaredVarsMap
          );
          if (defContext === currentContext) {
            found = true;
            announceJump(cm, pos, defPos, varName);
          }
        }
      }
    }
  });

  // Fallback search in current file
  if (!found) {
    traverse(ast, {
      VariableDeclarator(path) {
        if (found) return;

        const { node } = path;
        if (node.id.name === varName && node.loc) {
          const defPos = cm.posFromIndex(node.start);
          found = true;
          announceJump(cm, pos, defPos, varName);
        }
      },

      FunctionDeclaration(path) {
        if (found) return;

        const { node } = path;
        if (node.id?.name === varName) {
          const defPos = cm.posFromIndex(node.start);
          found = true;
          announceJump(cm, pos, defPos, varName);
        }
      }
    });
  }

  if (!found) {
    announceToScreenReader(`No definition found for ${varName}`, true);
  }
}
