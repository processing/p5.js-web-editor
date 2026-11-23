import { getEditorUrl } from './editorUrl';

describe('getEditorUrl', () => {
  const original = process.env.EDITOR_URL;
  afterEach(() => {
    process.env.EDITOR_URL = original;
  });

  it('returns EDITOR_URL', () => {
    process.env.EDITOR_URL = 'https://editor.example';
    expect(getEditorUrl()).toBe('https://editor.example');
  });

  it('strips trailing slashes so links do not get a double slash', () => {
    process.env.EDITOR_URL = 'https://editor.example//';
    expect(getEditorUrl()).toBe('https://editor.example');
  });

  it('throws if EDITOR_URL is unset, rather than building a broken link', () => {
    delete process.env.EDITOR_URL;
    expect(() => getEditorUrl()).toThrow('EDITOR_URL');
  });
});
