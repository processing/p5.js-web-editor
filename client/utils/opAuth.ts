/**
 * OpenProcessing OAuth 2.0 + PKCE in the browser.
 *
 * All auth state lives on the client. The OP access token is stored in
 * localStorage; PKCE state during the login round-trip lives in
 * sessionStorage (cleared on tab close).
 *
 * No editor-server endpoints are involved beyond serving the static
 * /auth/openprocessing/callback page that postMessages the code back.
 */

import { getConfig } from './getConfig';

const TOKEN_KEY = 'op_access_token';
const PKCE_KEY = 'op_pkce_state';
const CLIENT_ID = 'p5editor';

/** Derive OP origin from the bundled API_URL (e.g. `…/api` → `…`). */
export function getOpBaseUrl(): string {
  const apiUrl = getConfig('API_URL') ?? '';
  return apiUrl.replace(/\/api\/?$/, '');
}

/** Where OP redirects back after authorize. Must exactly match a registered redirectUri. */
export function getRedirectUri(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/auth/openprocessing/callback`;
}

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore (private mode etc.) */
  }
}

export function clearStoredToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// PKCE
// ---------------------------------------------------------------------------

function base64urlFromBytes(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  return window
    .btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function randomBase64Url(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  window.crypto.getRandomValues(buf);
  return base64urlFromBytes(buf);
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return base64urlFromBytes(new Uint8Array(hash));
}

interface PkceState {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
}

export async function makePkce(): Promise<PkceState> {
  const state = randomBase64Url(24);
  const codeVerifier = randomBase64Url(48);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  return { state, codeVerifier, codeChallenge };
}

/** Stash the PKCE state for this login attempt (sessionStorage clears on tab close). */
export function savePkce(p: { state: string; codeVerifier: string }): void {
  try {
    window.sessionStorage.setItem(PKCE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function loadPkce(): { state: string; codeVerifier: string } | null {
  try {
    const raw = window.sessionStorage.getItem(PKCE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPkce(): void {
  try {
    window.sessionStorage.removeItem(PKCE_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Authorize URL + token exchange + revoke
// ---------------------------------------------------------------------------

export function buildAuthorizeUrl(
  pkce: PkceState,
  scope = 'read write'
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: getRedirectUri(),
    state: pkce.state,
    scope,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: 'S256'
  });
  return `${getOpBaseUrl()}/oauth/p5login?${params.toString()}`;
}

interface ExchangeResponse {
  accessToken: string;
  scope: string;
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<ExchangeResponse> {
  const res = await fetch(`${getOpBaseUrl()}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: CLIENT_ID,
      code_verifier: codeVerifier
    })
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`OAuth token exchange failed (${res.status}): ${detail}`);
  }
  const json = await res.json();
  return { accessToken: json.access_token, scope: json.scope };
}

/** Best-effort revoke on OP and unconditional local clear. */
export async function revokeStoredToken(): Promise<void> {
  const token = getStoredToken();
  clearStoredToken();
  if (!token) return;
  try {
    await fetch(`${getOpBaseUrl()}/oauth/revoke`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token, client_id: CLIENT_ID })
    });
  } catch {
    /* ignore network errors — local state is already cleared */
  }
}
