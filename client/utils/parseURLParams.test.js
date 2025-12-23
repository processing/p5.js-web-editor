import { parseUrlParams } from './parseURLParams';
import { currentP5Version } from '../../common/p5Versions';

describe('parseUrlParams', () => {
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

  test('parses a valid p5 version and falls back for invalid versions', () => {
    const good = parseUrlParams('https://example.com?version=1.4.0');
    expect(good.version).toBe('1.4.0');

    const bad = parseUrlParams('https://example.com?version=9.9.9');
    expect(bad.version).toBe(currentP5Version);
  });

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
