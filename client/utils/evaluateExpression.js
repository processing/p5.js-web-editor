function __makeEvaluateExpression(evalInClosure) {
  return expr => evalInClosure(`
    ${expr}`);
}

function evaluateExpression() {
  return __makeEvaluateExpression((expr) => {
    let newExpr = expr;
    let result = null;
    let error = false;
    try {
      try {
        const wrapped = `(${expr})`;
        const validate = new Function(wrapped); // eslint-disable-line
        newExpr = wrapped; // eslint-disable-line
      } catch (e) {
        // We shouldn't wrap the expression
      }
      result = (0, eval)(newExpr); // eslint-disable-line
    } catch (e) {
      result = `${e.name}: ${e.message}`;
      error = true;
    }
    return { result, error };
  });
}

export default evaluateExpression();
