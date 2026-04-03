import getContext from './getContext';
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import classMap from './p5-instance-methods-and-creators.json';

const scopeMap = require('./p5-scope-function-access-map.json');

function getCurrentWordInfo(context) {
  const word = context.matchBefore(/\w*/);

  if (!word) {
    return {
      text: '',
      from: context.pos,
      to: context.pos
    };
  }

  return {
    text: word.text || '',
    from: word.from,
    to: context.pos
  };
}

function getExpressionBeforeCursor(state, pos) {
  const line = state.doc.lineAt(pos);
  const uptoCursor = line.text.slice(0, pos - line.from);
  const match = uptoCursor.match(
    /([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\.(?:[a-zA-Z_$][\w$]*)?$/
  );
  return match ? match[1] : null;
}

function getTypedMemberInfo(state, pos) {
  const line = state.doc.lineAt(pos);
  const uptoCursor = line.text.slice(0, pos - line.from);
  const dotMatch = uptoCursor.match(/\.([a-zA-Z_$][\w$]*)?$/);

  if (!dotMatch) {
    return {
      typed: '',
      from: pos,
      to: pos
    };
  }

  const typed = dotMatch[1] || '';
  const methodStart = pos - dotMatch[0].length + 1;

  return {
    typed,
    from: methodStart,
    to: pos
  };
}

function formatPreview(label, params = []) {
  if (!params.length) return `${label}()`;

  return `${label}(${params
    .map((param) => (param.o ? `[${param.p}]` : param.p))
    .join(', ')})`;
}

function makeBaseHintLookup(hints) {
  const byLabel = new Map();

  hints.forEach((hint) => {
    if (hint?.label) {
      byLabel.set(hint.label, hint);
    }
  });

  return byLabel;
}

function buildMethodOption(methodName, baseHint, range) {
  const params = baseHint?.params || [];

  return {
    label: methodName,
    type: 'method',
    kindLabel: baseHint?.kindLabel || 'fun',
    params,
    p5DocPath: baseHint?.p5DocPath,
    preview: baseHint?.preview || formatPreview(methodName, params),
    from: range.from,
    to: range.to
  };
}

function buildVarOrFunctionOption({
  name,
  isFunc,
  userDefinedFunctionMetadata,
  blacklist,
  range
}) {
  const fnMeta = userDefinedFunctionMetadata[name];
  const params = fnMeta?.params || [];

  let preview;

  if (isFunc) {
    if (fnMeta?.text) {
      preview = formatPreview(fnMeta.text, params);
    } else {
      preview = formatPreview(name, params);
    }
  } else {
    preview = undefined;
  }

  const isBlacklisted = blacklist.includes(name);

  return {
    label: fnMeta?.text || name,
    type: isFunc ? 'method' : 'variable',
    kindLabel: isFunc ? 'fun' : 'var',
    params,
    p5DocPath: undefined,
    preview,
    blacklisted: isBlacklisted,
    warning: isBlacklisted ? '⚠️ use with caution in this context' : null,
    from: range.from,
    to: range.to
  };
}

function buildGlobalHintOption(hint, blacklist, range) {
  return {
    ...hint,
    blacklisted: blacklist.includes(hint.label),
    warning: blacklist.includes(hint.label)
      ? '⚠️ use with caution in this context'
      : null,
    from: range.from,
    to: range.to
  };
}

export default function contextAwareHinter(context, { hints = [] } = {}) {
  const { state, pos } = context;
  const cm = state.doc.toString();

  const {
    variableToP5ClassMap = {},
    scopeToDeclaredVarsMap = {},
    userDefinedFunctionMetadata = {},
    userDefinedClassMetadata = {}
  } = p5CodeAstAnalyzer(cm) || {};

  const baseHintLookup = makeBaseHintLookup(hints);

  const baseExpression = getExpressionBeforeCursor(state, pos);

  if (baseExpression) {
    const className = variableToP5ClassMap[baseExpression];
    const userClassEntry = Object.values(userDefinedClassMetadata).find(
      (cls) => cls.initializer === baseExpression
    );

    let methods = [];

    if (userClassEntry?.methods) {
      methods = userClassEntry.methods;
    } else if (className && classMap[className]?.methods) {
      methods = classMap[className].methods;
    } else {
      return [];
    }

    const memberInfo = getTypedMemberInfo(state, pos);
    const typedLower = memberInfo.typed.toLowerCase();

    const options = methods
      .filter((method) => method.toLowerCase().startsWith(typedLower))
      .map((method) =>
        buildMethodOption(method, baseHintLookup.get(method), memberInfo)
      );

    return {
      from: memberInfo.from,
      to: memberInfo.to,
      options,
      filter: false
    };
  }

  const wordInfo = getCurrentWordInfo(context);
  const lowerCurrentWord = wordInfo.text.toLowerCase();

  const currentContext = getContext(cm, pos);
  const blacklist = scopeMap[currentContext]?.blacklist || [];

  function isInScope(varName) {
    return Object.entries(scopeToDeclaredVarsMap).some(
      ([scope, vars]) =>
        varName in vars && (scope === 'global' || scope === currentContext)
    );
  }

  const allVarNames = Array.from(
    new Set(
      Object.values(scopeToDeclaredVarsMap)
        .map((scopeVars) => Object.keys(scopeVars))
        .flat()
        .filter((name) => typeof name === 'string')
    )
  );

  const localOptions = allVarNames
    .filter(
      (varName) =>
        varName.toLowerCase().startsWith(lowerCurrentWord) && isInScope(varName)
    )
    .map((varName) => {
      const isFunc =
        scopeToDeclaredVarsMap[currentContext]?.[varName] === 'fun' ||
        (!scopeToDeclaredVarsMap[currentContext]?.[varName] &&
          scopeToDeclaredVarsMap.global?.[varName] === 'fun');

      return buildVarOrFunctionOption({
        name: varName,
        isFunc,
        userDefinedFunctionMetadata,
        blacklist,
        range: wordInfo
      });
    });

  const globalOptions = hints
    .filter(
      (hint) =>
        hint &&
        typeof hint.label === 'string' &&
        hint.label.toLowerCase().startsWith(lowerCurrentWord)
    )
    .map((hint) => buildGlobalHintOption(hint, blacklist, wordInfo));

  const combinedOptions = [...localOptions, ...globalOptions];

  const typePriority = {
    method: 0,
    variable: 1,
    keyword: 2,
    constant: 3,
    boolean: 4,
    obj: 5,
    other: 6
  };

  combinedOptions.sort((a, b) => {
    const isBlacklistedA = a.blacklisted ? 1 : 0;
    const isBlacklistedB = b.blacklisted ? 1 : 0;

    if (isBlacklistedA !== isBlacklistedB) {
      return isBlacklistedA - isBlacklistedB;
    }

    const typeA = typePriority[a.type] ?? typePriority.other;
    const typeB = typePriority[b.type] ?? typePriority.other;

    if (typeA !== typeB) {
      return typeA - typeB;
    }

    return a.label.localeCompare(b.label);
  });

  return {
    from: wordInfo.from,
    to: wordInfo.to,
    options: combinedOptions,
    filter: false
  };
}
