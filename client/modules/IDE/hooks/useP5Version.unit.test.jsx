import React from 'react';
import { reduxRender } from '../../../test-utils';
import { initialState as filesInitialState } from '../reducers/files';
import { p5PreloadAddonURL } from '../../../../common/p5URLs';
import { hasNoProtect } from '../utils/loopProtection';
import { P5VersionProvider, useP5Version } from './useP5Version';

const P5_SCRIPT = 'https://cdn.jsdelivr.net/npm/p5@2.3.2/lib/p5.js';

function indexHtml({ noprotect = false, sound = false } = {}) {
  const soundTag = sound
    ? '\n    <script src="https://cdn.jsdelivr.net/npm/p5.sound@0.4.1/dist/p5.sound.min.js"></script>'
    : '';
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="${P5_SCRIPT}"></script>${soundTag}
  </head>
  <body></body>
</html>`;
  return noprotect ? `<!-- noprotect -->\n${html}` : html;
}

let capturedVersionInfo = null;

function VersionProbe() {
  const { versionInfo } = useP5Version();
  capturedVersionInfo = versionInfo;
  return null;
}

function renderVersionInfo(indexContent) {
  capturedVersionInfo = null;
  reduxRender(
    <P5VersionProvider>
      <VersionProbe />
    </P5VersionProvider>,
    {
      initialState: {
        files: filesInitialState().map((file) => ({
          ...file,
          ...(file.fileType === 'file' &&
            file.name === 'index.html' &&
            file.filePath === '' && { content: indexContent })
        }))
      }
    }
  );
  return capturedVersionInfo;
}

describe('useP5Version HTML rewrites', () => {
  afterEach(() => {
    capturedVersionInfo = null;
  });

  it('keeps <!-- noprotect --> when replaceVersion rewrites index.html', () => {
    const versionInfo = renderVersionInfo(indexHtml({ noprotect: true }));
    const next = versionInfo.replaceVersion('2.3.3');

    expect(hasNoProtect(next)).toBe(true);
    expect(next).toContain('p5@2.3.3/lib/p5.js');
    expect(next.match(/<!--\s*noprotect\s*-->/g)).toHaveLength(1);
  });

  it('does not insert <!-- noprotect --> when the original had none', () => {
    const versionInfo = renderVersionInfo(indexHtml());
    const next = versionInfo.replaceVersion('2.3.3');

    expect(hasNoProtect(next)).toBe(false);
    expect(next).toContain('p5@2.3.3/lib/p5.js');
  });

  it('keeps <!-- noprotect --> when addon setters rewrite index.html', () => {
    const versionInfo = renderVersionInfo(
      indexHtml({ noprotect: true, sound: true })
    );

    const afterSoundOff = versionInfo.setP5Sound(false);
    expect(hasNoProtect(afterSoundOff)).toBe(true);
    expect(afterSoundOff).not.toContain('p5.sound');

    const afterPreload = versionInfo.setP5PreloadAddon(true);
    expect(hasNoProtect(afterPreload)).toBe(true);
    expect(afterPreload).toContain(p5PreloadAddonURL);
  });
});
