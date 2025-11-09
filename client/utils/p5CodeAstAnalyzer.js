/* eslint-disable */
import { debounce } from 'lodash';
import * as eslintScope from 'eslint-scope';
import classMap from '../utils/p5-instance-methods-and-creators.json';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const allFuncs = require('../utils/p5-reference-functions.json');
const allFunsList = new Set(allFuncs.functions.list);

const functionToClass = {};
Object.entries(classMap).forEach(([className, classData]) => {
  const createMethods = classData.createMethods || [];
  createMethods.forEach((fnName) => {
    functionToClass[fnName] = className;
  });
});

let lastValidResult = {
  variableToP5ClassMap: {},
  scopeToDeclaredVarsMap: {},
  userDefinedFunctionMetadata: {},
  userDefinedClassMetadata: {}
};

function _p5CodeAstAnalyzer(_cm) {
  const code = _cm.getValue();
  let ast;

  try {
    ast = parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx', 'classProperties'],
      ranges: true,
      locations: true
    });
  } catch (e) {
    return lastValidResult;
  }

  const variableToP5ClassMap = {};
  const scopeToDeclaredVarsMap = {};
  const userDefinedFunctionMetadata = {};
  const userDefinedClassMetadata = {};

  const scopeManager = eslintScope.analyze(ast, {
    ecmaVersion: 2020,
    sourceType: 'script'
  });

  scopeManager.scopes.forEach((scope) => {
    const scopeName =
      scope.type === 'function'
        ? scope.block.id?.name || '<anonymous>'
        : scope.type;

    scope.variables.forEach((variable) => {
      variable.defs.forEach((def) => {
        if (
          def.type === 'Variable' ||
          (def.type === 'FunctionName' && !allFunsList.has(def.name.name))
        ) {
          if (!scopeToDeclaredVarsMap[scopeName]) {
            scopeToDeclaredVarsMap[scopeName] = {};
          }
          const defType = def.type === 'FunctionName' ? 'fun' : 'var';
          scopeToDeclaredVarsMap[scopeName][def.name.name] = defType;
        }
      });
    });
  });

  traverse(ast, {
    ClassDeclaration(path) {
      const node = path.node;
      if (node.id && node.id.type === 'Identifier') {
        const className = node.id.name;
        const classInfo = {
          const: new Set(),
          fields: new Set(),
          methods: [],
          constructor_params: [],
          methodVars: {}
        };

        node.body.body.forEach((element) => {
          if (element.type === 'ClassMethod') {
            const methodName = element.key.name;

            if (element.kind === 'constructor') {
              element.params.forEach((param) => {
                if (param.type === 'Identifier') {
                  classInfo.constructor_params.push(param.name);
                } else if (
                  param.type === 'AssignmentPattern' &&
                  param.left.type === 'Identifier'
                ) {
                  classInfo.constructor_params.push(param.left.name);
                } else if (param.type === 'ObjectPattern') {
                  param.properties.forEach((prop) => {
                    if (prop.key && prop.key.type === 'Identifier') {
                      classInfo.constructor_params.push(prop.key.name);
                    }
                  });
                } else if (param.type === 'ArrayPattern') {
                  param.elements.forEach((el) => {
                    if (el && el.type === 'Identifier') {
                      classInfo.constructor_params.push(el.name);
                    }
                  });
                }
              });

              traverse(
                element,
                {
                  VariableDeclaration(innerPath) {
                    innerPath.node.declarations.forEach((decl) => {
                      if (decl.id.type === 'Identifier') {
                        classInfo.const.add(decl.id.name);
                      }
                    });
                  }
                },
                path.scope,
                path
              );
            } else {
              classInfo.methods.push(methodName);

              const localVars = [];
              element.body.body.forEach((stmt) => {
                if (stmt.type === 'VariableDeclaration') {
                  stmt.declarations.forEach((decl) => {
                    if (decl.id.type === 'Identifier') {
                      localVars.push(decl.id.name);
                    }
                  });
                }
              });

              classInfo.methodVars[methodName] = localVars;
            }

            traverse(
              element,
              {
                AssignmentExpression(innerPath) {
                  const expr = innerPath.node;
                  if (
                    expr.left.type === 'MemberExpression' &&
                    expr.left.object.type === 'ThisExpression' &&
                    expr.left.property.type === 'Identifier'
                  ) {
                    const propName = expr.left.property.name;
                    classInfo.fields.add(propName);
                  }
                },

                CallExpression(innerPath) {
                  const callee = innerPath.node.callee;
                  if (
                    callee.type === 'MemberExpression' &&
                    callee.object.type === 'ThisExpression' &&
                    callee.property.type === 'Identifier'
                  ) {
                    const methodName = callee.property.name;
                    classInfo.fields.add(methodName);
                  }
                }
              },
              path.scope,
              path
            );
          }
        });

        userDefinedClassMetadata[className] = {
          const: Array.from(classInfo.const),
          fields: Array.from(classInfo.fields),
          methods: classInfo.methods,
          constructor_params: classInfo.constructor_params,
          initializer: '',
          methodVars: classInfo.methodVars
        };
      }
    }
  });

  traverse(ast, {
    AssignmentExpression(path) {
      const node = path.node;
      if (
        node.left.type === 'Identifier' &&
        (node.right.type === 'CallExpression' ||
          node.right.type === 'NewExpression') &&
        node.right.callee.type === 'Identifier'
      ) {
        const varName = node.left.name;
        const fnName = node.right.callee.name;
        const cls = functionToClass[fnName];
        const userCls = userDefinedClassMetadata[fnName];
        if (userCls) {
          userDefinedClassMetadata[fnName].initializer = varName;
        } else if (cls) {
          variableToP5ClassMap[varName] = cls;
        }
      }
    },

    VariableDeclarator(path) {
      const node = path.node;
      if (
        node.id.type === 'Identifier' &&
        (node.init?.type === 'CallExpression' ||
          node.init?.type === 'NewExpression') &&
        node.init.callee.type === 'Identifier'
      ) {
        const varName = node.id.name;
        const fnName = node.init.callee.name;
        const cls = functionToClass[fnName];
        const userCls = userDefinedClassMetadata[fnName];
        if (userCls) {
          userDefinedClassMetadata[fnName].initializer = varName;
        } else if (cls) {
          variableToP5ClassMap[varName] = cls;
        }
      }
    },

    FunctionDeclaration(path) {
      const node = path.node;
      if (node.id && node.id.name) {
        const fnName = node.id.name;
        if (!allFunsList.has(fnName)) {
          const params = node.params
            .map((param) => {
              if (param.type === 'Identifier') {
                return { p: param.name, o: false };
              } else if (
                param.type === 'AssignmentPattern' &&
                param.left.type === 'Identifier'
              ) {
                return { p: param.left.name, o: true };
              } else if (
                param.type === 'RestElement' &&
                param.argument.type === 'Identifier'
              ) {
                return { p: param.argument.name, o: true };
              }
              return null;
            })
            .filter(Boolean);

          userDefinedFunctionMetadata[fnName] = {
            text: fnName,
            type: 'fun',
            p5: false,
            params
          };

          if (!scopeToDeclaredVarsMap[fnName]) {
            scopeToDeclaredVarsMap[fnName] = {};
          }
          params.forEach((paramObj) => {
            if (paramObj && paramObj.p) {
              scopeToDeclaredVarsMap[fnName][paramObj.p] = 'param';
            }
          });
        }
      }
    }
  });

  const result = {
    variableToP5ClassMap,
    scopeToDeclaredVarsMap,
    userDefinedFunctionMetadata,
    userDefinedClassMetadata
  };

  lastValidResult = result;
  return result;
}

export default debounce(_p5CodeAstAnalyzer, 200, {
  leading: true,
  trailing: true,
  maxWait: 300
});
