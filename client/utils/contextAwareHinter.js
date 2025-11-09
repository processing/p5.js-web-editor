import getContext from './getContext';
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import classMap from './p5-instance-methods-and-creators.json';

const scopeMap = require('./p5-scope-function-access-map.json');

function getExpressionBeforeCursor(cm) {
  const cursor = cm.getCursor();
  const line = cm.getLine(cursor.line);
  const uptoCursor = line.slice(0, cursor.ch);
  const match = uptoCursor.match(
    /([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\.(?:[a-zA-Z_$][\w$]*)?$/
  );
  return match ? match[1] : null;
}

export default function contextAwareHinter(cm, options = {}) {
  const {
    variableToP5ClassMap = {},
    scopeToDeclaredVarsMap = {},
    userDefinedFunctionMetadata = {},
    userDefinedClassMetadata = {}
  } = p5CodeAstAnalyzer(cm) || {};

  const { hinter } = options;
  if (!hinter || typeof hinter.search !== 'function') {
    return [];
  }

  const baseExpression = getExpressionBeforeCursor(cm);

  if (baseExpression) {
    const className = variableToP5ClassMap[baseExpression];
    const userClassEntry = Object.values(userDefinedClassMetadata).find(
      (cls) => cls.initializer === baseExpression
    );

    let methods = [];

    if (userClassEntry?.methods) {
      const { methods: userMethods } = userClassEntry;
      methods = userMethods;
    } else if (className && classMap[className]?.methods) {
      const { methods: classMethods } = classMap[className];
      methods = classMethods;
    } else {
      return [];
    }

    const cursor = cm.getCursor();
    const lineText = cm.getLine(cursor.line);
    const dotMatch = lineText
      .slice(0, cursor.ch)
      .match(/\.([a-zA-Z_$][\w$]*)?$/);

    let from = cursor;
    if (dotMatch) {
      const fullMatch = dotMatch[0];
      const methodStart = cursor.ch - fullMatch.length + 1;
      from = { line: cursor.line, ch: methodStart };
    } else {
      from = cursor;
    }

    const to = { line: cursor.line, ch: cursor.ch };
    const typed = dotMatch?.[1]?.toLowerCase() || '';

    const methodHints = methods
      .filter((method) => method.toLowerCase().startsWith(typed))
      .map((method) => ({
        item: {
          text: method,
          type: 'fun',
          isMethod: true
        },
        displayText: method,
        from,
        to
      }));

    return methodHints;
  }

  const { line, ch } = cm.getCursor();
  const { string } = cm.getTokenAt({ line, ch });
  const currentWord = string.trim();

  const currentContext = getContext(cm);
  const allHints = hinter.search(currentWord);

  // const whitelist = scopeMap[currentContext]?.whitelist || [];
  const blacklist = scopeMap[currentContext]?.blacklist || [];

  const lowerCurrentWord = currentWord.toLowerCase();

  function isInScope(varName) {
    return Object.entries(scopeToDeclaredVarsMap).some(
      ([scope, vars]) =>
        varName in vars && (scope === 'global' || scope === currentContext)
    );
  }

  const allVarNames = Array.from(
    new Set(
      Object.values(scopeToDeclaredVarsMap)
        .map((s) => Object.keys(s))
        .flat()
        .filter((name) => typeof name === 'string')
    )
  );

  const varHints = allVarNames
    .filter(
      (varName) =>
        varName.toLowerCase().startsWith(lowerCurrentWord) && isInScope(varName)
    )
    .map((varName) => {
      const isFunc =
        scopeToDeclaredVarsMap[currentContext]?.[varName] === 'fun' ||
        (!scopeToDeclaredVarsMap[currentContext]?.[varName] &&
          scopeToDeclaredVarsMap.global?.[varName] === 'fun');

      const baseItem = isFunc
        ? { ...userDefinedFunctionMetadata[varName] }
        : {
            text: varName,
            type: 'var',
            params: [],
            p5: false
          };

      return {
        item: baseItem,
        isBlacklisted: blacklist.includes(varName)
      };
    });

  const filteredHints = allHints
    .filter(
      (h) =>
        h &&
        h.item &&
        typeof h.item.text === 'string' &&
        h.item.text.toLowerCase().startsWith(lowerCurrentWord)
    )
    .map((hint) => {
      const name = hint.item?.text || '';
      const isBlacklisted = blacklist.includes(name);

      return {
        ...hint,
        isBlacklisted
      };
    });

  const combinedHints = [...varHints, ...filteredHints];

  const typePriority = {
    fun: 0,
    var: 1,
    keyword: 2,
    other: 3
  };

  const sorted = combinedHints.sort((a, b) => {
    const nameA = a.item?.text || '';
    const nameB = b.item?.text || '';
    const typeA = a.item?.type || 'other';
    const typeB = b.item?.type || 'other';

    const isBlacklistedA = a.isBlacklisted ? 1 : 0;
    const isBlacklistedB = b.isBlacklisted ? 1 : 0;

    const typeScoreA = typePriority[typeA] ?? typePriority.other;
    const typeScoreB = typePriority[typeB] ?? typePriority.other;

    if (isBlacklistedA !== isBlacklistedB) {
      return isBlacklistedA - isBlacklistedB;
    }

    if (typeScoreA !== typeScoreB) {
      return typeScoreA - typeScoreB;
    }

    return nameA.localeCompare(nameB);
  });

  return sorted;
}
