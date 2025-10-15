/* eslint-disable func-names */
import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { currentP5Version, p5Versions } from '../../../../common/p5Versions';

export const majorVersion = (version) => version.split('.')[0];

export const p5SoundURLOldTemplate =
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/$VERSION/addons/p5.sound.min.js';
export const p5SoundURLOld = p5SoundURLOldTemplate.replace(
  '$VERSION',
  currentP5Version
);
export const p5SoundURL =
  'https://cdn.jsdelivr.net/npm/p5.sound@0.2.0/dist/p5.sound.min.js';
export const p5PreloadAddonURL =
  'https://cdn.jsdelivr.net/npm/p5.js-compatibility@0.1.2/src/preload.js';
export const p5ShapesAddonURL =
  'https://cdn.jsdelivr.net/npm/p5.js-compatibility@0.1.2/src/shapes.js';
export const p5DataAddonURL =
  'https://cdn.jsdelivr.net/npm/p5.js-compatibility@0.1.2/src/data.js';
export const p5URL = `https://cdn.jsdelivr.net/npm/p5@${currentP5Version}/lib/p5.js`;

const P5VersionContext = React.createContext({});

export function P5VersionProvider(props) {
  const files = useSelector((state) => state.files);
  const indexFile = files.find(
    (file) =>
      file.fileType === 'file' &&
      file.name === 'index.html' &&
      file.filePath === ''
  );
  const indexSrc = indexFile?.content;
  const indexID = indexFile?.id;

  // { version: string, minified: boolean, replaceVersion: (version: string) => string } | null
  const versionInfo = useMemo(() => {
    if (!indexSrc) return null;
    const dom = new DOMParser().parseFromString(indexSrc, 'text/html');

    const serializeResult = () => {
      let src = dom.documentElement.outerHTML;

      if (dom.doctype) {
        const doctype = new XMLSerializer().serializeToString(dom.doctype);
        src = `${doctype}\n${src}`;
      }

      return src;
    };

    const usedP5Versions = [...dom.documentElement.querySelectorAll('script')]
      .map((scriptNode) => {
        const src = scriptNode.getAttribute('src') || '';
        const matches = [
          /^https?:\/\/cdnjs.cloudflare.com\/ajax\/libs\/p5.js\/(.+)\/p5\.(?:min\.)?js$/,
          /^https?:\/\/cdn.jsdelivr.net\/npm\/p5@(.+)\/lib\/p5\.(min\.)?js$/
        ].map((regex) => regex.exec(src));
        const match = matches.find((m) => m); // Find first that matched
        if (!match) return null;

        // See if this is a version we recognize
        if (p5Versions.includes(match[1])) {
          return { version: match[1], minified: !!match[2], scriptNode };
        }
        return null;
      })
      .filter((version) => version !== null);

    // We only know for certain which one we've got if
    if (usedP5Versions.length === 1) {
      const { version, minified, scriptNode } = usedP5Versions[0];

      const p5SoundNode = [
        ...dom.documentElement.querySelectorAll('script')
      ].find((s) =>
        [
          /^https?:\/\/cdnjs.cloudflare.com\/ajax\/libs\/p5.js\/(.+)\/addons\/p5\.sound(?:\.min)?\.js$/,
          /^https?:\/\/cdn.jsdelivr.net\/npm\/p5@(.+)\/lib\/addons\/p5\.sound(?:\.min)?\.js$/,
          /^https?:\/\/cdn.jsdelivr.net\/npm\/p5.sound@(.+)\/dist\/p5\.sound(?:\.min)?\.js$/
        ].some((regex) => regex.exec(s.getAttribute('src') || ''))
      );
      const setP5Sound = function (enabled) {
        if (!enabled && p5SoundNode) {
          p5SoundNode.parentNode.removeChild(p5SoundNode);
        } else if (enabled && !p5SoundNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute(
            'src',
            majorVersion(version) === '2'
              ? p5SoundURL
              : p5SoundURLOldTemplate.replace('$VERSION', version)
          );
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const setP5SoundURL = function (url) {
        if (p5SoundNode) {
          p5SoundNode.setAttribute('src', url);
        } else {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', url);
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const replaceVersion = function (newVersion) {
        const file = minified ? 'p5.min.js' : 'p5.js';
        scriptNode.setAttribute(
          'src',
          `https://cdn.jsdelivr.net/npm/p5@${newVersion}/lib/${file}`
        );

        if (p5SoundNode) {
          if (majorVersion(version) !== majorVersion(newVersion)) {
            // Turn off p5.sound if the user switched from 1.x to 2.x
            setP5Sound(false);
          } else {
            // Replace the existing p5.sound with the one compatible with
            // the new version
            setP5SoundURL(
              majorVersion(version) === '2'
                ? p5SoundURL
                : p5SoundURLOldTemplate.replace('$VERSION', newVersion)
            );
          }
        }

        return serializeResult();
      };

      const p5PreloadAddonNode = [
        ...dom.documentElement.querySelectorAll('script')
      ].find((s) => s.getAttribute('src') === p5PreloadAddonURL);
      const setP5PreloadAddon = function (enabled) {
        if (!enabled && p5PreloadAddonNode) {
          p5PreloadAddonNode.parentNode.removeChild(p5PreloadAddonNode);
        } else if (enabled && !p5PreloadAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5PreloadAddonURL);
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const p5ShapesAddonNode = [
        ...dom.documentElement.querySelectorAll('script')
      ].find((s) => s.getAttribute('src') === p5ShapesAddonURL);
      const setP5ShapesAddon = function (enabled) {
        if (!enabled && p5ShapesAddonNode) {
          p5ShapesAddonNode.parentNode.removeChild(p5ShapesAddonNode);
        } else if (enabled && !p5ShapesAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5ShapesAddonURL);
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const p5DataAddonNode = [
        ...dom.documentElement.querySelectorAll('script')
      ].find((s) => s.getAttribute('src') === p5DataAddonURL);
      const setP5DataAddon = function (enabled) {
        if (!enabled && p5DataAddonNode) {
          p5DataAddonNode.parentNode.removeChild(p5DataAddonNode);
        } else if (enabled && !p5DataAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5DataAddonURL);
          scriptNode.parentNode.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      return {
        version,
        isVersion2: majorVersion(version) === '2',
        minified,
        replaceVersion,
        p5Sound: !!p5SoundNode,
        setP5Sound,
        setP5SoundURL,
        p5SoundURL: p5SoundNode?.getAttribute('src'),
        p5PreloadAddon: !!p5PreloadAddonNode,
        setP5PreloadAddon,
        p5ShapesAddon: !!p5ShapesAddonNode,
        setP5ShapesAddon,
        p5DataAddon: !!p5DataAddonNode,
        setP5DataAddon
      };
    }
    return null;
  }, [indexSrc]);

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = { indexID, versionInfo };

  return (
    <P5VersionContext.Provider value={value}>
      {props.children}
    </P5VersionContext.Provider>
  );
}

P5VersionProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useP5Version() {
  return useContext(P5VersionContext);
}
