import evaluateExpression from './evaluateExpression';

export default function handleConsoleExpressions(expression) {
  try {
    return evaluateExpression()(expression);
  } catch (e) {
    const data = [e.toString()];
    window.postMessage([{
      log: Array.of({ method: 'error', data }),
      source: 'sketch'
    }], '*');
  }
  return '';
}
