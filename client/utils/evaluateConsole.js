import createScopedEvaluationChain from './createScopedEvaluationChain';

let evalNext = createScopedEvaluationChain((next) => {
  evalNext = next;
});

export default function handleConsoleExpressions(expression) {
  try {
    return evalNext(expression);
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
