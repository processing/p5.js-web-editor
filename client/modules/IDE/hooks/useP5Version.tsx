/* eslint-disable func-names */
import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { currentP5Version, p5Versions } from '../../../../common/p5Versions';
import {
  p5SoundURLOldTemplate,
  p5SoundURL,
  p5PreloadAddonURL,
  p5ShapesAddonURL,
  p5DataAddonURL,
  p5URLTemplate
} from '../../../../common/p5URLs';
import type { RootState } from '../../../reducers';

export const majorVersion = (version: string) => version.split('.')[0];

export const p5SoundURLOld = p5SoundURLOldTemplate.replace(
  '$VERSION',
  currentP5Version
);
export const p5URL = p5URLTemplate.replace('$VERSION', currentP5Version);

const P5VersionContext = React.createContext<{
  indexID: string;
  versionInfo: {
    version: string;
    isVersion2: boolean;
    minified: boolean;
    replaceVersion: (newVersion: string) => void;
    p5Sound: boolean;
    setP5Sound: (enabled: boolean) => string;
    setP5SoundURL: (url: string) => string;
    p5SoundURL: string | null;
    p5PreloadAddon: boolean;
    setP5PreloadAddon: (enabled: boolean) => string;
    p5ShapesAddon: boolean;
    setP5ShapesAddon: (enabled: boolean) => string;
    p5DataAddon: boolean;
    setP5DataAddon: (enabled: boolean) => string;
  } | null;
} | null>(null);

export function P5VersionProvider(props: { children: React.ReactNode }) {
  const files = useSelector((state: RootState) => state.files);
  const indexFile = files.find(
    // TODO: clairepeng94 - update this to Project > File type once backend migration is complete
    (file: { fileType: string; name: string; filePath: string }) =>
      file.fileType === 'file' &&
      file.name === 'index.html' &&
      file.filePath === ''
  );
  const indexSrc = indexFile?.content;
  const indexID = indexFile?.id;

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

    const scriptNodes = [...dom.documentElement.querySelectorAll('script')];

    const usedP5Versions = scriptNodes
      .map((scriptNode) => {
        const src = scriptNode.getAttribute('src') || '';
        const matches = [
          /^https?:\/\/cdnjs.cloudflare.com\/ajax\/libs\/p5.js\/(.+)\/p5\.(?:min\.)?js$/,
          /^https?:\/\/cdn.jsdelivr.net\/npm\/p5@(.+)\/lib\/p5\.(min\.)?js$/
        ].map((regex) => regex.exec(src));
        const match = matches.find((m) => m); // Find first that matched
        if (!match) return null;

        // See if this is a version we recognize
        const versionExists = p5Versions.some((v) =>
          typeof v === 'string' ? v === match[1] : v.version === match[1]
        );
        if (versionExists) {
          return { version: match[1], minified: !!match[2], scriptNode };
        }
        return null;
      })
      .filter((version) => version !== null);

    // We only know for certain which one we've got if
    if (usedP5Versions.length === 1) {
      const { version, minified, scriptNode } = usedP5Versions[0];

      const p5SoundNode = scriptNodes.find((s) =>
        [
          /^https?:\/\/cdnjs.cloudflare.com\/ajax\/libs\/p5.js\/(.+)\/addons\/p5\.sound(?:\.min)?\.js$/,
          /^https?:\/\/cdn.jsdelivr.net\/npm\/p5@(.+)\/lib\/addons\/p5\.sound(?:\.min)?\.js$/,
          /^https?:\/\/cdn.jsdelivr.net\/npm\/p5.sound@(.+)\/dist\/p5\.sound(?:\.min)?\.js$/
        ].some((regex) => regex.exec(s.getAttribute('src') || ''))
      );

      const setP5Sound = function (enabled: boolean) {
        if (!enabled && p5SoundNode) {
          p5SoundNode.parentNode?.removeChild(p5SoundNode);
        } else if (enabled && !p5SoundNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute(
            'src',
            majorVersion(version) === '2'
              ? p5SoundURL
              : p5SoundURLOldTemplate.replace('$VERSION', version)
          );
          scriptNode.parentNode?.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const setP5SoundURL = function (url: string) {
        if (p5SoundNode) {
          p5SoundNode.setAttribute('src', url);
        } else {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', url);
          scriptNode.parentNode?.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const replaceVersion = function (newVersion: string) {
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

      const p5PreloadAddonNode = scriptNodes.find(
        (s) => s.getAttribute('src') === p5PreloadAddonURL
      );

      const setP5PreloadAddon = function (enabled: boolean) {
        if (!enabled && p5PreloadAddonNode) {
          p5PreloadAddonNode.parentNode?.removeChild(p5PreloadAddonNode);
        } else if (enabled && !p5PreloadAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5PreloadAddonURL);
          scriptNode.parentNode?.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const p5ShapesAddonNode = scriptNodes.find(
        (s) => s.getAttribute('src') === p5ShapesAddonURL
      );

      const setP5ShapesAddon = function (enabled: boolean) {
        if (!enabled && p5ShapesAddonNode) {
          p5ShapesAddonNode.parentNode?.removeChild(p5ShapesAddonNode);
        } else if (enabled && !p5ShapesAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5ShapesAddonURL);
          scriptNode.parentNode?.insertBefore(newNode, scriptNode.nextSibling);
        }
        return serializeResult();
      };

      const p5DataAddonNode = scriptNodes.find(
        (s) => s.getAttribute('src') === p5DataAddonURL
      );

      const setP5DataAddon = function (enabled: boolean) {
        if (!enabled && p5DataAddonNode) {
          p5DataAddonNode.parentNode?.removeChild(p5DataAddonNode);
        } else if (enabled && !p5DataAddonNode) {
          const newNode = document.createElement('script');
          newNode.setAttribute('src', p5DataAddonURL);
          scriptNode.parentNode?.insertBefore(newNode, scriptNode.nextSibling);
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
        p5SoundURL: p5SoundNode?.getAttribute('src') ?? null,
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

export function useP5Version() {
  const context = useContext(P5VersionContext);

  if (!context) {
    throw new Error('useP5Version must be used within a P5VersionProvider');
  }

  return context;
}
