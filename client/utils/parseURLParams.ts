import { p5Versions, currentP5Version } from '../../common/p5Versions';

interface defaultsTypes {
  sound: boolean;
  preload: boolean;
  shapes: boolean;
  data: boolean;
}

const DEFAULTS: defaultsTypes = {
  sound: true,
  preload: false,
  shapes: false,
  data: false
};

/**
 * Sorts version strings in descending order and returns the highest version
 * @param {string[]} versions - Array of version strings (e.g., ['1.11.2', '1.11.1'])
 * @returns {string} The highest version from the array
 */

function getNewestVersion(versions: string[]): string {
  return versions.sort((a, b) => {
    const pa = a.split('.').map((n) => parseInt(n, 10));
    const pb = b.split('.').map((n) => parseInt(n, 10));
    for (let i = 0; i < 3; i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na !== nb) return nb - na;
    }
    return 0;
  })[0];
}

function validateVersion(version: string | null): string {
  if (!version) return currentP5Version;

  const ver = String(version).trim();

  if (p5Versions.includes(ver)) return ver;

  // if only major.minor provided like "1.11"
  const majorMinorMatch = /^(\d+)\.(\d+)$/.exec(ver);
  if (majorMinorMatch) {
    const [, major, minor] = majorMinorMatch;
    const versionStrings = p5Versions.map((v) =>
      typeof v === 'string' ? v : v.version
    );
    const matches = versionStrings.filter((v) => {
      const parts = v.split('.');
      return parts[0] === major && parts[1] === minor;
    });
    if (matches.length) {
      return getNewestVersion(matches);
    }
  }

  // if only major provided like "1"
  const majorOnlyMatch = /^(\d+)$/.exec(ver);
  if (majorOnlyMatch) {
    const [, major] = majorOnlyMatch;
    const versionStrings = p5Versions.map((v) =>
      typeof v === 'string' ? v : v.version
    );
    const matches = versionStrings.filter((v) => v.split('.')[0] === major);
    if (matches.length) {
      return getNewestVersion(matches);
    }
  }

  return currentP5Version;
}

function validateBool(value: string | null, defaultValue: boolean): boolean {
  if (!value) return defaultValue;

  const v = String(value).trim().toLowerCase();

  const TRUTHY = new Set(['on', 'true', '1']);
  const FALSY = new Set(['off', 'false', '0']);

  if (TRUTHY.has(v)) return true;
  if (FALSY.has(v)) return false;

  return defaultValue;
}

export interface ParsedUrlParams {
  version: string;
  sound: boolean;
  preload: boolean;
  shapes: boolean;
  data: boolean;
}

export function parseUrlParams(url: string): ParsedUrlParams {
  const params = new URLSearchParams(
    new URL(url, 'https://dummy.origin').search
  );

  return {
    version: validateVersion(params.get('version')),
    sound: validateBool(params.get('sound'), DEFAULTS.sound),
    preload: validateBool(params.get('preload'), DEFAULTS.preload),
    shapes: validateBool(params.get('shapes'), DEFAULTS.shapes),
    data: validateBool(params.get('data'), DEFAULTS.data)
  };
}
