// eslint-disable-next-line no-unused-vars
function createScopedEvaluationChain(__yieldScopedEval) {
  function __makeEvaluateExpression(evalInClosure) {
    return function (expr) {
      return evalInClosure(`
        __yieldScopedEval(__makeEvaluateExpression(function(expr) {
          return eval(expr);
        }));
        ${expr}
        `);
    };
  }
  // eslint-disable-next-line no-eval
  return __makeEvaluateExpression(expr => eval(expr));
}

export default createScopedEvaluationChain;
