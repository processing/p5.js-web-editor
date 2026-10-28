import * as acorn from 'acorn';
import { jsPreprocess } from './jsPreprocess';

describe('jsPreprocess', () => {
  describe('<!-- noprotect -->', () => {
    it('returns code unchanged when <!-- noprotect --> is present in index.html', () => {
      const code = 'for (let i = 0; i < 10; i++) {}';
      const indexSrc = '<!-- noprotect -->\n<html></html>';

      expect(jsPreprocess(code, indexSrc)).toBe(code);
    });
  });

  describe('regular loop protection', () => {
    it('adds loop protection to a for loop', () => {
      const code = 'for (let i = 0; i < 10; i++) {}';
      const result = jsPreprocess(code, '');
      expect(result).toContain('window.loopProtect.hit');
      expect(result).toContain('Date.now()');
    });

    it('adds loop protection to a while loop', () => {
      const code = 'while (true) {}';
      const result = jsPreprocess(code, '');
      expect(result).toContain('window.loopProtect.hit');
    });

    it('adds loop protection to a do-while loop', () => {
      const code = 'do {} while (true)';
      const result = jsPreprocess(code, '');
      expect(result).toContain('window.loopProtect.hit');
    });

    it('returns original code if transform fails', () => {
      const code = 'this is not valid javascript @@@@';
      expect(jsPreprocess(code, '')).toBe(code);
    });

    it('handles module scripts with import statements', () => {
      const code = `
        import something from 'somewhere';
        for (let i = 0; i < 10; i++) {}
      `;
      const result = jsPreprocess(code, '');
      expect(result).toContain('window.loopProtect.hit');
    });
  });

  describe('shader strings', () => {
    it('does not modify for loops inside template literal shader strings', () => {
      const code = `
        const shader = \`
          for (int i = 0; i < 20; i++) {
            total += texture(tex, uv);
          }
        \`;
      `;
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('does not modify for loops inside single-quoted strings', () => {
      const code = "const glsl = 'for (int i = 0; i < 10; i++) {}';";
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('does not modify GLSL inside buildFilterShader object argument', () => {
      const code = `
        blur = buildFilterShader({
          'vec4 getColor': \`(FilterInputs inputs) {
            for (int i = 0; i < 20; i++) {
              total += getTexture(canvasContent, inputs.texCoord);
            }
          }\`
        });
      `;
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });
  });

  describe('p5.strands shader functions', () => {
    it('skips loop protection for named function passed to buildFilterShader', () => {
      const code = `
        blur = buildFilterShader(doBlur);
        function doBlur() {
          for (let i = 0; i < 20; i++) {}
        }
      `;
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for arrow function variable passed to buildFilterShader', () => {
      const code = `
        const doBlur = () => {
          for (let i = 0; i < 20; i++) {}
        };
        blur = buildFilterShader(doBlur);
      `;
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for inline function passed to buildFilterShader', () => {
      const code = `
        blur = buildFilterShader(function() {
          for (let i = 0; i < 20; i++) {}
        });
      `;
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for function passed to base*Shader().modify()', () => {
      const code = `
        blur = baseFilterShader().modify(doBlur);
        function doBlur() {
          for (let i = 0; i < 20; i++) {}
        }
      `;
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for function passed to any .modify() call', () => {
      const code = `
        blur = someCustomShader().modify(doBlur);
        function doBlur() {
          for (let i = 0; i < 20; i++) {}
        }
      `;
      const result = jsPreprocess(code, '');
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('still protects regular loops outside shader functions', () => {
      const code = `
        blur = buildFilterShader(doBlur);
        function doBlur() {
          for (let i = 0; i < 20; i++) {}
        }
        function draw() {
          for (let j = 0; j < 100; j++) {}
        }
      `;
      const result = jsPreprocess(code, '');
      expect(result).toContain('window.loopProtect.hit');
    });
  });

  describe('line numbers', () => {
    const lineOf = (text, marker) =>
      text.split('\n').findIndex((line) => line.includes(marker)) + 1;

    it('keeps a runtime error on the line where it was written (#4356)', () => {
      const code = [
        'function setup() {',
        '  createCanvas(200, 200);',
        '  background(220);',
        '',
        ...Array.from({ length: 10 }, (_, i) => `  // padding ${i + 1}`),
        '',
        '',
        '  let x = 0;',
        '  for (let i = 0; i < 1; i++) {',
        '    x += 1;',
        '  }',
        '',
        '',
        '  // deliberate error below',
        '',
        '  definitelyNotAFunction();',
        '}'
      ].join('\n');
      expect(lineOf(code, 'definitelyNotAFunction')).toBe(25);

      const result = jsPreprocess(code, '');

      expect(result).toContain('window.loopProtect.hit(18)');
      expect(lineOf(result, 'definitelyNotAFunction')).toBe(25);
    });

    it('only changes the lines that contain a loop', () => {
      const code = `// comment
let x = 0;
/* block comment
   over two lines */

for (let i = 0; i < 2; i++) {
  // nested loop
  for (let j = 0; j < 2; j++) {
    x += i * j;
  }
}
for (let i = 0; i < 2; i++) x++;
while (x > 100) x--; do { x++; } while (x < 5);
if (x > 0) {
  while (x > 10) x--;
} else {
  do x++; while (x < 0);
}
if (x < 0) for (;;) x++; else while (x < 0) x++;
outer: for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 2; j++) {
    if (j) continue outer;
  }
}

definitelyNotAFunction();`;

      const result = jsPreprocess(code, '');

      expect(() =>
        acorn.parse(result, { ecmaVersion: 'latest' })
      ).not.toThrow();
      expect(result.match(/window\.loopProtect\.hit/g)).toHaveLength(11);
      const codeLines = code.split('\n');
      const resultLines = result.split('\n');
      expect(resultLines).toHaveLength(codeLines.length);
      const changed = codeLines
        .map((line, i) => (line === resultLines[i] ? null : i + 1))
        .filter(Boolean);
      expect(changed).toEqual([6, 8, 12, 13, 15, 17, 19, 20, 21]);
    });

    it('inserts each guard at its own loop when edits share an offset', () => {
      const timer = (n) => `var _LP${n} = Date.now(); `;
      const check = (n, line) =>
        `if (Date.now() - _LP${n} > 100) { window.loopProtect.hit(${line}); break; }`;
      const code = 'while (a) a--;while (b) {while (c) {}}\nwhile (d) d--;';

      expect(jsPreprocess(code, '')).toBe(
        `${timer(0)}while (a) { ${check(0, 1)} a--; }` +
          `${timer(2)}while (b) { ${check(2, 1)}` +
          `${timer(1)}while (c) { ${check(1, 1)}}}\n` +
          `${timer(3)}while (d) { ${check(3, 2)} d--; }`
      );
    });

    it('still stops infinite loops and reports their original line', () => {
      const run = (code) => {
        const hits = [];
        const window = { loopProtect: { hit: (line) => hits.push(line) } };
        // eslint-disable-next-line no-new-func
        const result = new Function('window', `${code}\nreturn result;`)(
          window
        );
        return { result, hits };
      };

      const finite = jsPreprocess(
        `let result = 0;
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) result++;
}
do result++; while (result < 12);`,
        ''
      );
      expect(run(finite)).toEqual({ result: 12, hits: [] });

      const infinite = jsPreprocess(
        '// comment\n\nlet result = "stopped";\nwhile (true) {}',
        ''
      );
      expect(run(infinite)).toEqual({ result: 'stopped', hits: [4] });
    });
  });
});
