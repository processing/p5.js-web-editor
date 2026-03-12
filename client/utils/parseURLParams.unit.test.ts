import { parseUrlParams } from './parseURLParams';
import { p5Versions, currentP5Version } from '../../common/p5Versions';

function getVersionString(
  item: string | { version: string; label: string }
): string {
  return typeof item === 'string' ? item : item.version;
}

const p5VersionStrings = p5Versions.map(getVersionString);

describe('parseUrlParams', () => {
  describe('default behavior', () => {
    test('returns defaults when no params are provided', () => {
      const url = 'https://example.com';
      const result = parseUrlParams(url);

      expect(result).toEqual({
        version: currentP5Version,
        sound: true,
        preload: false,
        shapes: false,
        data: false
      });
    });

    test('falls back to defaults for unsupported inputs', () => {
      const url =
        'https://example.com?version=A&sound=A&preload=A&shapes=A&data=A';
      const result = parseUrlParams(url);

      expect(result).toEqual({
        version: currentP5Version,
        sound: true,
        preload: false,
        shapes: false,
        data: false
      });
    });
  });

  describe('version parsing', () => {
    // Uses regex since p5Versions may be updated over time.
    // Checks to ensure version is valid too.

    test('parses a valid p5 version and falls back for invalid versions', () => {
      const good = parseUrlParams('https://example.com?version=1.4.0');
      expect(good.version).toBe('1.4.0');

      const bad = parseUrlParams('https://example.com?version=invalid-version');
      expect(bad.version).toBe(currentP5Version);
    });

    test('parses major.minor version 0.5.x to newest patch', () => {
      const url = 'https://example.com?version=0.5';
      const result = parseUrlParams(url);

      expect(result.version).toMatch(/^0\.5\.\d+$/);
      expect(p5VersionStrings).toContain(result.version);
    });

    test('parses major version 0 to newest 0.x version', () => {
      const url = 'https://example.com?version=0';
      const result = parseUrlParams(url);

      expect(result.version).toMatch(/^0\.\d+\.\d+$/);
      expect(p5VersionStrings).toContain(result.version);
    });

    test('parses major version 1 to newest 1.x version', () => {
      const url = 'https://example.com?version=1';
      const result = parseUrlParams(url);
      expect(result.version).toMatch(/^1\.\d+\.\d+$/);
      expect(p5VersionStrings).toContain(result.version);
    });

    test('parses major.minor version 1.1.x to newest patch', () => {
      const url = 'https://example.com?version=1.1';
      const result = parseUrlParams(url);
      expect(result.version).toMatch(/^1\.1\.\d+$/);
      expect(p5VersionStrings).toContain(result.version);
    });

    test('parses major version 2 to newest 2.x version', () => {
      const url = 'https://example.com?version=2';
      const result = parseUrlParams(url);
      expect(result.version).toMatch(/^2\.\d+\.\d+$/);
      expect(p5VersionStrings).toContain(result.version);
    });

    test('parses major.minor version 2.0.x to newest patch', () => {
      const url = 'https://example.com?version=2.0';
      const result = parseUrlParams(url);
      expect(result.version).toMatch(/^2\.0\.\d+$/);
      expect(p5VersionStrings).toContain(result.version);
    });
  });

  describe('boolean param parsing', () => {
    test('parses boolean-like params for sound/preload/shapes/data (true variants)', () => {
      const trueVariants = ['on', 'true', '1', 'ON', 'True'];

      trueVariants.forEach((v) => {
        const url = `https://example.com?sound=${v}&preload=${v}&shapes=${v}&data=${v}`;
        const result = parseUrlParams(url);
        expect(result.sound).toBe(true);
        expect(result.preload).toBe(true);
        expect(result.shapes).toBe(true);
        expect(result.data).toBe(true);
      });
    });

    test('parses boolean-like params for sound/preload/shapes/data (false variants)', () => {
      const falseVariants = ['off', 'false', '0', 'OFF', 'False'];

      falseVariants.forEach((v) => {
        const url = `https://example.com?sound=${v}&preload=${v}&shapes=${v}&data=${v}`;
        const result = parseUrlParams(url);
        expect(result.sound).toBe(false);
        expect(result.preload).toBe(false);
        expect(result.shapes).toBe(false);
        expect(result.data).toBe(false);
      });
    });
  });
});
