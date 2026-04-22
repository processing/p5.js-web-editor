import loopProtect from 'loop-protect';
import { Hook, Decode, Encode } from 'console-feed';
import StackTrace from 'stacktrace-js';
import { evaluateExpression } from './evaluateExpression';

// should postMessage user the dispatcher? does the parent window need to
// be registered as a frame? or a just a listener?

// could maybe send these as a message idk
// const { editor } = window;
const editor = window.parent.parent;
const { editorOrigin } = window;
const htmlOffset = 12;
window.objectUrls[window.location.href] = '/index.html';
const blobPath = window.location.href.split('/').pop();
window.objectPaths[blobPath] = 'index.html';

window.loopProtect = loopProtect;

const consoleBuffer = [];
const LOGWAIT = 500;
Hook(window.console, (log) => {
  consoleBuffer.push({
    log
  });
});
setInterval(() => {
  if (consoleBuffer.length > 0) {
    const message = {
      messages: consoleBuffer,
      source: 'sketch'
    };
    editor.postMessage(message, editorOrigin);
    consoleBuffer.length = 0;
  }
}, LOGWAIT);

function detectMissingEquals(err) {
  const evidence = err.evidence || '';
  const match = /(let|const|var)\s+([a-z_$][\w$]*)\s+(\d|['"`]|true\b|false\b|null\b)/i.exec(
    evidence
  );
  if (!match) return null;
  return { keyword: match[1], name: match[2] };
}

function refineJshintReason(err) {
  if (/missing semicolon/i.test(err.reason || '')) {
    const eq = detectMissingEquals(err);
    if (eq) {
      return `Missing '=' in ${eq.keyword} declaration of '${eq.name}'`;
    }
  }
  return err.reason;
}

function friendlyHintForJshint(err) {
  const prefix = `[${err.file}, line ${err.line}]`;
  const reason = err.reason || '';
  const eq = detectMissingEquals(err);
  if (eq && /missing semicolon/i.test(reason)) {
    return `${prefix} a '=' is missing between the variable name '${eq.name}' and its value.`;
  }
  if (/expected an identifier/i.test(reason)) {
    return `${prefix} a value or variable name is missing before the symbol here.`;
  }
  if (/missing semicolon/i.test(reason)) {
    return `${prefix} a ';' might be missing at the end of this statement.`;
  }
  if (/unclosed (string|regular expression)/i.test(reason)) {
    return `${prefix} a string or regular expression is not closed with a matching quote or delimiter.`;
  }
  if (/missing '\)'/i.test(reason)) {
    return `${prefix} a closing ')' is missing. check for unbalanced parentheses.`;
  }
  if (/missing '\}'/i.test(reason)) {
    return `${prefix} a closing '}' is missing. check for unbalanced braces.`;
  }
  if (/unmatched '/i.test(reason)) {
    return `${prefix} a bracket, brace, or parenthesis on this line does not have a matching partner.`;
  }
  if (/unexpected early end/i.test(reason)) {
    return `${prefix} the code ended while a block was still open. a '}' or ')' may be missing.`;
  }
  if (
    /unexpected '?;'?/i.test(reason) ||
    /unexpected token ';'/i.test(reason)
  ) {
    return `${prefix} there is an extra or misplaced ';' on this line.`;
  }
  if (
    /use of const before it was defined|'[a-z_$][\w$]*' was used before it was defined/i.test(
      reason
    )
  ) {
    return `${prefix} a name is being used before it is declared.`;
  }
  return `${prefix} ${reason}`;
}

if (Array.isArray(window.__jshintErrors) && window.__jshintErrors.length > 0) {
  const messagesBatch = [];
  window.__jshintErrors.forEach((err) => {
    const refinedReason = refineJshintReason(err);
    const location = `${err.file}:${err.line}:${err.character}`;
    const data = `SyntaxError: ${refinedReason} at ${location}`;
    const id = `${Date.now()}-${err.file}-${err.line}-${err.character}`;
    messagesBatch.push({
      log: [
        {
          method: 'error',
          data: [data],
          id,
          meta: {
            name: 'SyntaxError',
            message: refinedReason,
            stack: [
              {
                fileName: err.file,
                functionName: null,
                lineNumber: err.line,
                columnNumber: err.character
              }
            ]
          }
        }
      ]
    });
  });
  const mdn =
    'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Errors/Unexpected_token#What_went_wrong';
  const hintLines = window.__jshintErrors
    .map((err) => friendlyHintForJshint(err))
    .join('\n');
  messagesBatch.push({
    log: [
      {
        method: 'log',
        data: [`🌸 p5.js says:\n${hintLines}\n\n+ More info: ${mdn}`],
        id: `${Date.now()}-jshint-friendly`
      }
    ]
  });
  editor.postMessage(
    {
      source: 'sketch',
      messages: messagesBatch
    },
    editorOrigin
  );
}

function handleMessageEvent(e) {
  // maybe don't need this?? idk!
  if (window.origin !== e.origin) return;
  const { data } = e;
  const { source, messages } = data;
  if (source === 'console' && Array.isArray(messages)) {
    const decodedMessages = messages.map((message) => Decode(message.log));
    decodedMessages.forEach((message) => {
      const { data: args } = message;
      const { result, error } = evaluateExpression(args);
      const resultMessages = [
        { log: Encode({ method: error ? 'error' : 'result', data: [result] }) }
      ];
      editor.postMessage(
        {
          messages: resultMessages,
          source: 'sketch'
        },
        editorOrigin
      );
    });
  }
}

window.addEventListener('message', handleMessageEvent);

function resolveFileName(rawName) {
  if (!rawName) return rawName;
  if (window.objectUrls[rawName]) return window.objectUrls[rawName];
  const withBlob = `blob:${rawName}`;
  if (window.objectUrls[withBlob]) return window.objectUrls[withBlob];
  const segment = rawName.split('/').pop();
  if (window.objectPaths[segment]) return window.objectPaths[segment];
  return rawName;
}

function resolveStackFrame({
  fileName,
  functionName,
  lineNumber,
  columnNumber
}) {
  const resolvedFileName = resolveFileName(fileName);
  let resolvedLineNumber = lineNumber;
  if (resolvedFileName === 'index.html' && lineNumber) {
    resolvedLineNumber = lineNumber - htmlOffset;
  }
  return {
    fileName: resolvedFileName,
    functionName: functionName || null,
    lineNumber: resolvedLineNumber || null,
    columnNumber: columnNumber || null
  };
}

function formatStackFrame({
  fileName,
  functionName,
  lineNumber,
  columnNumber
}) {
  const name = functionName || '(anonymous function)';
  if (lineNumber && columnNumber) {
    return `\n    at ${name} (${fileName}:${lineNumber}:${columnNumber})`;
  }
  return `\n    at ${name} (${fileName})`;
}

function postErrorMessage(data, meta) {
  const log = {
    method: 'error',
    data: [data],
    id: Date.now().toString()
  };
  if (meta) log.meta = meta;
  editor.postMessage(
    {
      source: 'sketch',
      messages: [
        {
          log: [log]
        }
      ]
    },
    editorOrigin
  );
}

// catch reference errors, via http://stackoverflow.com/a/12747364/2994108
window.onerror = async function onError(
  msg,
  source,
  lineNumber,
  columnNo,
  error
) {
  if (!error) {
    postErrorMessage(msg);
    return false;
  }
  let rawStack = [];
  if (error.stack) {
    try {
      rawStack = await StackTrace.fromError(error);
    } catch (e) {
      rawStack = [];
    }
  }
  if (rawStack.length === 0) {
    rawStack = [
      {
        fileName: source,
        functionName: null,
        lineNumber,
        columnNumber: columnNo
      }
    ];
  }
  const resolvedStack = rawStack.map(resolveStackFrame);
  let data = `${error.name}: ${error.message}`;
  resolvedStack.forEach((frame) => {
    data = data.concat(formatStackFrame(frame));
  });
  postErrorMessage(data, {
    name: error.name,
    message: error.message,
    stack: resolvedStack
  });
  return false;
};
// catch rejected promises
window.onunhandledrejection = async function onUnhandledRejection(event) {
  if (!event.reason || !event.reason.message) return;
  let rawStack = [];
  if (event.reason.stack) {
    try {
      rawStack = await StackTrace.fromError(event.reason);
    } catch (e) {
      rawStack = [];
    }
  }
  const resolvedStack = rawStack.map(resolveStackFrame);
  let data = `${event.reason.name}: ${event.reason.message}`;
  resolvedStack.forEach((frame) => {
    data = data.concat(formatStackFrame(frame));
  });
  postErrorMessage(data, {
    name: event.reason.name,
    message: event.reason.message,
    stack: resolvedStack
  });
};

// Monkeypatch p5._friendlyError
const _report = window.p5?._report;

if (_report) {
  window.p5._report = function resolvedReport(message, method, color) {
    const urls = Object.keys(window.objectUrls);
    const paths = Object.keys(window.objectPaths);
    let newMessage = message;
    urls.forEach((url) => {
      newMessage = newMessage.replaceAll(url, window.objectUrls[url]);
      if (newMessage.match('index.html')) {
        const onLineRegex = /on line (?<lineNo>.\d) in/gm;
        const lineNoRegex = /index\.html:(?<lineNo>.\d):/gm;
        const match = onLineRegex.exec(newMessage);
        const line = match.groups.lineNo;
        const resolvedLine = parseInt(line, 10) - htmlOffset;
        newMessage = newMessage.replace(
          onLineRegex,
          `on line ${resolvedLine} in`
        );
        newMessage = newMessage.replace(
          lineNoRegex,
          `index.html:${resolvedLine}:`
        );
      }
    });
    paths.forEach((path) => {
      newMessage = newMessage.replaceAll(path, window.objectPaths[path]);
    });
    _report.apply(window.p5, [newMessage, method, color]);
  };
}
