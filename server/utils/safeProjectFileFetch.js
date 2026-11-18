import dns from 'dns';
import http from 'http';
import https from 'https';
import net from 'net';

const MAX_REDIRECTS = 3;
export const MAX_PROJECT_FILE_BYTES = 25 * 1024 * 1024;
const TIMEOUT_MS = 10000;

function isPublicIPv4(address) {
  const parts = address.split('.').map(Number);
  const value = parts.reduce((result, part) => result * 256 + part, 0);
  const blockedRanges = [
    [0x00000000, 8],
    [0x0a000000, 8],
    [0x64400000, 10],
    [0x7f000000, 8],
    [0xa9fe0000, 16],
    [0xa83f8110, 32], // Azure platform virtual IP
    [0xac100000, 12],
    [0xc0000000, 24],
    [0xc0000200, 24],
    [0xc0586300, 24],
    [0xc0a80000, 16],
    [0xc6120000, 15],
    [0xc6336400, 24],
    [0xcb007100, 24],
    [0xe0000000, 4],
    [0xf0000000, 4]
  ];
  return !blockedRanges.some(
    ([base, prefix]) =>
      Math.floor(value / 2 ** (32 - prefix)) ===
      Math.floor(base / 2 ** (32 - prefix))
  );
}

function expandIPv6(address) {
  let normalized = address.toLowerCase();
  if (normalized.includes('.')) {
    const lastColon = normalized.lastIndexOf(':');
    const ipv4Parts = normalized
      .slice(lastColon + 1)
      .split('.')
      .map(Number);
    const high = (ipv4Parts[0] * 256 + ipv4Parts[1]).toString(16);
    const low = (ipv4Parts[2] * 256 + ipv4Parts[3]).toString(16);
    normalized = `${normalized.slice(0, lastColon + 1)}${high}:${low}`;
  }
  const [leftText, rightText = ''] = normalized.split('::');
  const left = leftText ? leftText.split(':') : [];
  const right = rightText ? rightText.split(':') : [];
  return [
    ...left,
    ...Array(8 - left.length - right.length).fill('0'),
    ...right
  ].map((word) => parseInt(word, 16) || 0);
}

function isPublicIPv6(address) {
  const words = expandIPv6(address);
  if (words.length !== 8) return false;

  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    const ipv4 = `${Math.floor(words[6] / 256)}.${words[6] % 256}.${Math.floor(
      words[7] / 256
    )}.${words[7] % 256}`;
    return isPublicIPv4(ipv4);
  }

  const inGlobalUnicast = words[0] >= 0x2000 && words[0] < 0x4000;
  const inIetfSpecialUse = words[0] === 0x2001 && words[1] <= 0x01ff;
  const inDocumentation =
    (words[0] === 0x2001 && words[1] === 0x0db8) ||
    (words[0] === 0x3fff && words[1] < 0x1000);
  const inSixToFour = words[0] === 0x2002;
  return (
    inGlobalUnicast && !inIetfSpecialUse && !inDocumentation && !inSixToFour
  );
}

function isPublicAddress(address) {
  const version = net.isIP(address);
  if (version === 4) return isPublicIPv4(address);
  if (version === 6) return isPublicIPv6(address);
  return false;
}

function hasExplicitPort(rawUrl) {
  const authority = rawUrl.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#]*)/i)?.[1];
  if (!authority) return false;
  const host = authority.slice(authority.lastIndexOf('@') + 1);
  if (host.startsWith('[')) return /^\[[^\]]+\]:/.test(host);
  return host.includes(':');
}

function resolveHost(hostname) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('DNS lookup timed out')),
      TIMEOUT_MS
    );
    dns.promises.lookup(hostname, { all: true, verbatim: true }).then(
      (addresses) => {
        clearTimeout(timeout);
        resolve(addresses);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function requestOnce(url, address, family) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const agent = new transport.Agent({
      lookup: (_hostname, options, callback) => {
        if (options && options.all) callback(null, [{ address, family }]);
        else callback(null, address, family);
      }
    });
    let settled = false;
    let request;
    const deadline = setTimeout(() => {
      if (request) request.destroy(new Error('Project file fetch timed out'));
    }, TIMEOUT_MS);
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      callback(value);
    };
    try {
      request = transport.get(
        url,
        { agent, timeout: TIMEOUT_MS },
        (response) => {
          if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
            const redirect = response.headers.location;
            response.destroy();
            finish(resolve, {
              redirect,
              isRedirect: true
            });
            return;
          }
          if (response.statusCode < 200 || response.statusCode >= 300) {
            response.destroy();
            finish(reject, new Error('Project file fetch failed'));
            return;
          }
          const declaredSize = Number(response.headers['content-length']);
          if (declaredSize > MAX_PROJECT_FILE_BYTES) {
            response.destroy(new Error('Project file too large'));
            finish(reject, new Error('Project file too large'));
            return;
          }
          const chunks = [];
          let size = 0;
          response.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_PROJECT_FILE_BYTES) {
              response.destroy(new Error('Project file too large'));
              finish(reject, new Error('Project file too large'));
            } else {
              chunks.push(chunk);
            }
          });
          response.on('end', () =>
            finish(resolve, { data: Buffer.concat(chunks) })
          );
          response.on('aborted', () =>
            finish(reject, new Error('Project file response aborted'))
          );
          response.on('error', (error) => finish(reject, error));
        }
      );
    } catch (error) {
      clearTimeout(deadline);
      reject(error);
      return;
    }
    request.on('timeout', () =>
      request.destroy(new Error('Project file fetch timed out'))
    );
    request.on('error', (error) => finish(reject, error));
  });
}

async function fetchUrl(url, explicitPort, redirects) {
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    explicitPort
  ) {
    throw new Error('Unsupported project file URL');
  }
  let addresses;
  try {
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    addresses = net.isIP(hostname)
      ? [{ address: hostname, family: net.isIP(hostname) }]
      : await resolveHost(hostname);
  } catch (error) {
    throw new Error('Project file host could not be resolved');
  }
  if (
    !addresses.length ||
    addresses.some((entry) => !isPublicAddress(entry.address))
  ) {
    throw new Error('Project file host is not public');
  }
  const result = await requestOnce(
    url,
    addresses[0].address,
    addresses[0].family
  );
  if (!result.isRedirect) return result.data;
  if (redirects === MAX_REDIRECTS)
    throw new Error('Too many project file redirects');
  if (!result.redirect) throw new Error('Invalid project file redirect');
  const explicitRedirectPort =
    hasExplicitPort(result.redirect) ||
    (/^\/\//.test(result.redirect) &&
      hasExplicitPort(`https:${result.redirect}`));
  let redirectUrl;
  try {
    redirectUrl = new URL(result.redirect, url);
  } catch (error) {
    throw new Error('Invalid project file redirect');
  }
  return fetchUrl(redirectUrl, explicitRedirectPort, redirects + 1);
}

export default async function safeProjectFileFetch(rawUrl) {
  if (typeof rawUrl !== 'string') throw new Error('Invalid project file URL');
  let url;
  try {
    url = new URL(rawUrl);
  } catch (error) {
    throw new Error('Invalid project file URL');
  }
  return fetchUrl(url, hasExplicitPort(rawUrl), 0);
}
