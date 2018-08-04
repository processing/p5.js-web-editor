// Reference: https://github.com/popcodeorg/popcode/blob/4885baee880a612d5a420427b207699ef790d6c4/src/previewSupport/createScopedEvaluationChain.js
function createScopedEvaluationChain(__yieldScopedEval) {
  function __makeEvaluateExpression(evalInClosure) {
    return expr => evalInClosure(`
        __yieldScopedEval(__makeEvaluateExpression(function(expr) {
          return eval(expr);
        })); 
        ${expr}`);
  }
  return __makeEvaluateExpression(expr => eval(expr));  // eslint-disable-line
}

export default createScopedEvaluationChain;
