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
  return __makeEvaluateExpression(expr => eval(expr));  // eslint-disable-line
}

export default createScopedEvaluationChain;
