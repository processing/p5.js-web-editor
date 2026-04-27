import { jsPreprocess } from './jsPreprocess';

describe('jsPreprocess', () => {
  describe('// noprotect', () => {
    it('returns code unchanged when // noprotect is present', () => {
      const code = '// noprotect\nfor (let i = 0; i < 10; i++) {}';
      expect(jsPreprocess(code)).toBe(code);
    });
  });

  describe('regular loop protection', () => {
    it('adds loop protection to a for loop', () => {
      const code = 'for (let i = 0; i < 10; i++) {}';
      const result = jsPreprocess(code);
      expect(result).toContain('window.loopProtect.hit');
      expect(result).toContain('Date.now()');
    });

    it('adds loop protection to a while loop', () => {
      const code = 'while (true) {}';
      const result = jsPreprocess(code);
      expect(result).toContain('window.loopProtect.hit');
    });

    it('adds loop protection to a do-while loop', () => {
      const code = 'do {} while (true)';
      const result = jsPreprocess(code);
      expect(result).toContain('window.loopProtect.hit');
    });

    it('returns original code if transform fails', () => {
      const code = 'this is not valid javascript @@@@';
      expect(jsPreprocess(code)).toBe(code);
    });

    it('handles module scripts with import statements', () => {
      const code = `
        import something from 'somewhere';
        for (let i = 0; i < 10; i++) {}
      `;
      const result = jsPreprocess(code);
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
      const result = jsPreprocess(code);
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('does not modify for loops inside single-quoted strings', () => {
      const code = "const glsl = 'for (int i = 0; i < 10; i++) {}';";
      const result = jsPreprocess(code);
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
      const result = jsPreprocess(code);
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
      const result = jsPreprocess(code);
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for arrow function variable passed to buildFilterShader', () => {
      const code = `
        const doBlur = () => {
          for (let i = 0; i < 20; i++) {}
        };
        blur = buildFilterShader(doBlur);
      `;
      const result = jsPreprocess(code);
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for inline function passed to buildFilterShader', () => {
      const code = `
        blur = buildFilterShader(function() {
          for (let i = 0; i < 20; i++) {}
        });
      `;
      const result = jsPreprocess(code);
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for function passed to base*Shader().modify()', () => {
      const code = `
        blur = baseFilterShader().modify(doBlur);
        function doBlur() {
          for (let i = 0; i < 20; i++) {}
        }
      `;
      const result = jsPreprocess(code);
      expect(result).not.toContain('window.loopProtect.hit');
    });

    it('skips loop protection for function passed to any .modify() call', () => {
      const code = `
        blur = someCustomShader().modify(doBlur);
        function doBlur() {
          for (let i = 0; i < 20; i++) {}
        }
      `;
      const result = jsPreprocess(code);
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
      const result = jsPreprocess(code);
      expect(result).toContain('window.loopProtect.hit');
    });
  });
});
