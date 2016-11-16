var iframeWindow = window;
var originalConsole = iframeWindow.console;
iframeWindow.console = {};

var methods = [
  'debug', 'clear', 'error', 'info', 'log', 'warn'
];

var consoleBuffer = [];
var LOGWAIT = 500;

methods.forEach( function(method) {
  iframeWindow.console[method] = function() {
    originalConsole[method].apply(originalConsole, arguments);

    var args = Array.from(arguments);
    args = args.map(function(i) {
      // catch objects
      return (typeof i === 'string') ? i : JSON.stringify(i);
    });

    consoleBuffer.push({
      method: method,
      arguments: args,
      source: 'sketch'
    });
  };
});

setInterval(function() {
  if (consoleBuffer.length > 0) {
    window.parent.postMessage(consoleBuffer, '*');
    consoleBuffer.length = 0;
  }
}, LOGWAIT);