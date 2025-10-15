import { parseNumber, parseBoolean } from './parseStringToType';

jest.mock('./checkTestEnv', () => ({
  isTestEnvironment: false
}));

describe('parseNumber', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses a valid number string to number', () => {
    expect(parseNumber('42')).toBe(42);
    expect(parseNumber('3.14')).toBeCloseTo(3.14);
    expect(parseNumber('0')).toBe(0);
  });

  it('returns 0 if input is undefined and nullishNumber is true', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseNumber(undefined, true)).toBe(0);
    expect(warnSpy).toHaveBeenCalledWith('parseNumber: got nullish input');
  });

  it('returns 0 if input is an empty string and nullishNumber is true', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseNumber('', true)).toBe(0);
    expect(warnSpy).toHaveBeenCalledWith('parseNumber: got nullish input');
  });

  it('returns undefined and warns if input is undefined and nullishNumber is false', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseNumber(undefined, false)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('parseNumber: got nullish input');
  });

  it('returns undefined and warns if input is an empty string and nullishNumber is false', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseNumber('', false)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('parseNumber: got nullish input');
  });

  it('returns undefined and warns if parsing fails', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    const input = 'abc';
    expect(parseNumber(input)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      `parseNumber: expected a number, got ${input}`
    );
  });
});

describe('parseBoolean', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses "true" and "false" strings (case-insensitive) to booleans', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('TRUE')).toBe(true);
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean('FALSE')).toBe(false);
  });

  it('returns false if input is undefined and nullishBool is true', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseBoolean(undefined, true)).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('parseBoolean: got nullish input');
  });

  it('returns false if input is empty string and nullishBool is true', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseBoolean('', true)).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('parseBoolean: got nullish input');
  });

  it('returns undefined and warns if input is undefined and nullishBool is false', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseBoolean(undefined, false)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('parseBoolean: got nullish input');
  });

  it('returns undefined and warns if input is empty string and nullishBool is false', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    expect(parseBoolean('', false)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('parseBoolean: got nullish input');
  });

  it('returns undefined and warns if parsing fails', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    const input = 'yes';
    expect(parseBoolean(input)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      `parseBoolean: expected 'true' or 'false', got "${input}"`
    );
  });
});
