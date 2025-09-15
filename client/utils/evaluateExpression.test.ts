import { evaluateExpression } from './evaluateExpression';

describe('evaluateExpression', () => {
  it('evaluates simple expressions correctly', () => {
    const { result, error } = evaluateExpression('2 + 2');
    expect(error).toBe(false);
    expect(result).toBe(4);
  });

  it('evaluates expressions with objects', () => {
    const { result, error } = evaluateExpression('{ a: 1, b: 2 }.a + 1');
    expect(error).toBe(false);
    expect(result).toBe(2);
  });

  it('returns an error object on invalid expression', () => {
    const { result, error } = evaluateExpression('foo.bar(');
    expect(error).toBe(true);
    expect(result).toMatch(/SyntaxError|Unexpected token|Unexpected end/);
  });

  it('evaluates expressions that throw runtime errors', () => {
    const { result, error } = evaluateExpression('null.foo');
    expect(error).toBe(true);
    expect(result).toMatch(/TypeError|Cannot read property/);
  });

  it('handles expressions that are valid without parentheses', () => {
    // e.g., function calls without wrapping
    const { result, error } = evaluateExpression('Math.max(3, 5)');
    expect(error).toBe(false);
    expect(result).toBe(5);
  });

  // not sure how else this is used in ./previewEntry
});
