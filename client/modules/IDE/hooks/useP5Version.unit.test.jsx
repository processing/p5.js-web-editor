import React from 'react';
import { reduxRender } from '../../../test-utils';
import { initialState as filesInitialState } from '../reducers/files';
import { P5VersionProvider, useP5Version } from './useP5Version';
import { NO_PROTECT_REGEX } from '../utils/loopProtection';

describe('P5VersionProvider', () => {
  const buildIndex = (version, { noprotect = false } = {}) =>
    `${noprotect ? '<!-- noprotect -->\n' : ''}<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/p5@${version}/lib/p5.js"></script>
  </head>
  <body></body>
</html>`;

  const renderWithIndex = (indexContent) => {
    let versionInfo = null;
    function Consumer() {
      ({ versionInfo } = useP5Version());
      return null;
    }
    reduxRender(
      <P5VersionProvider>
        <Consumer />
      </P5VersionProvider>,
      {
        initialState: {
          files: filesInitialState().map((file) =>
            file.fileType === 'file' &&
            file.name === 'index.html' &&
            file.filePath === ''
              ? { ...file, content: indexContent }
              : file
          )
        }
      }
    );
    return versionInfo;
  };

  it('keeps the noprotect comment when changing the p5.js version', () => {
    const versionInfo = renderWithIndex(
      buildIndex('2.3.2', { noprotect: true })
    );

    const result = versionInfo.replaceVersion('2.3.4');

    expect(result).toMatch(NO_PROTECT_REGEX);
    expect(result.match(/<!--\s*noprotect\s*-->/g)).toHaveLength(1);
    expect(result).toContain('npm/p5@2.3.4/lib/p5.js');
  });

  it('keeps the noprotect comment when toggling an add-on', () => {
    const versionInfo = renderWithIndex(
      buildIndex('2.3.2', { noprotect: true })
    );

    expect(versionInfo.setP5DataAddon(true)).toMatch(NO_PROTECT_REGEX);
  });

  it('does not add a noprotect comment when changing the p5.js version', () => {
    const versionInfo = renderWithIndex(buildIndex('2.3.2'));

    const result = versionInfo.replaceVersion('2.3.4');

    expect(result).not.toMatch(NO_PROTECT_REGEX);
  });
});
