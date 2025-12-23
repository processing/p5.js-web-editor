interface EvalResult {
  result: unknown;
  error: boolean;
}

type EvalInClosureFn = (expr: string) => EvalResult;

function makeEvaluateExpression(evalInClosure: EvalInClosureFn) {
  return (expr: string) =>
    evalInClosure(`
    ${expr}`);
}

export function evaluateExpressionWrapper(): (expr: string) => EvalResult {
  return makeEvaluateExpression(
    (expr: string): EvalResult => {
      let newExpr = expr;
      let result = null;
      let error = false;
      try {
        try {
          const wrapped = `(${expr})`;
          // eslint-disable-next-line no-new-func
          const validate = new Function(wrapped);
          newExpr = wrapped;
        } catch (e) {
          // We shouldn't wrap the expression
        }
        // eslint-disable-next-line no-eval
        result = (0, eval)(newExpr);
      } catch (e) {
        if (e instanceof Error) {
          result = `${e.name}: ${e.message}`;
        } else {
          result = String(e);
        }
        error = true;
      }
      return { result, error };
    }
  );
}

export const evaluateExpression = evaluateExpressionWrapper();
