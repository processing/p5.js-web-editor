import evaluateExpression from './evaluateExpression';

export default function handleConsoleExpressions(expression) {
  try {
    return evaluateExpression()(expression);
  } catch (e) {
    const data = e.toString();
    window.postMessage([{
      method: 'error',
      arguments: data,
      source: 'sketch'
    }], '*');
  }
  return '';
}
