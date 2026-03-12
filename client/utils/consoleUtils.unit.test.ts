import { getAllScriptOffsets, startTag } from './consoleUtils';

describe('getAllScriptOffsets', () => {
  // not sure how the line offset calculations have been formulated
  it('returns an empty array when no scripts are found', () => {
    const html = '<html><body><h1>No scripts here</h1></body></html>';
    expect(getAllScriptOffsets(html)).toEqual([]);
  });

  it('detects a single external script with @fs- path', () => {
    const html = `
      <html>
        <head>
          <script src="${startTag}my-script.js"></script>
        </head>
      </html>
    `;
    const result = getAllScriptOffsets(html);
    expect(result.every(([offset, _]) => typeof offset === 'number')).toBe(
      true
    );
    expect(result.map(([_, name]) => name)).toEqual(['my-script']);
  });

  it('detects multiple external scripts with @fs- paths', () => {
    const html = `
      <script src="${startTag}one.js"></script>
      <script src="${startTag}two.js"></script>
    `;
    const result = getAllScriptOffsets(html);
    expect(result.every(([offset, _]) => typeof offset === 'number')).toBe(
      true
    );
    expect(result.map(([_, name]) => name)).toEqual(['one', 'two']);
  });

  it('detects embedded scripts with crossorigin attribute', () => {
    const html = `
      <html>
        <head>
          <script crossorigin=""></script>
        </head>
      </html>
    `;
    const result = getAllScriptOffsets(html);
    expect(result.every(([offset, _]) => typeof offset === 'number')).toBe(
      true
    );
    expect(result.map(([_, name]) => name)).toEqual(['index.html']);
  });

  it('detects both @fs- scripts and embedded scripts together, ordering embedded scripts last', () => {
    const html = `
      <script src="${startTag}abc.js"></script>
      <script crossorigin=""></script>
      <script src="${startTag}xyz.js"></script>
    `;
    const result = getAllScriptOffsets(html);
    expect(result.every(([offset, _]) => typeof offset === 'number')).toBe(
      true
    );
    expect(result.map(([_, name]) => name)).toEqual([
      'abc',
      'xyz',
      'index.html'
    ]);
  });

  it('handles scripts with varying whitespace and newlines', () => {
    const html = `
      <script src="${startTag}some-script.js">
      </script>
      <script crossorigin="">
      </script>
    `;
    const result = getAllScriptOffsets(html);
    expect(result.every(([offset, _]) => typeof offset === 'number')).toBe(
      true
    );
    expect(result.map(([_, name]) => name)).toEqual([
      'some-script',
      'index.html'
    ]);
  });
});
