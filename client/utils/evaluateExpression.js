function __makeEvaluateExpression(evalInClosure) {
  return expr => evalInClosure(`
    ${expr}`);
}

function evaluateExpression() {
  return __makeEvaluateExpression((expr) => {
    let newExpr = expr;
    try {
      const wrapped = `(${expr})`;
      const validate = new Function(wrapped); // eslint-disable-line
      newExpr = wrapped; // eslint-disable-line
    } catch (e) {
      // We shouldn't wrap the expression
    }

    return (0, eval)(newExpr); // eslint-disable-line
  });
}

export default evaluateExpression;
