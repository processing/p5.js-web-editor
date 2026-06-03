import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Button } from '../../../common/Button';
import browserHistory from '../../../browserHistory';
import { remSize } from '../../../theme';
import {
  buildAuthorizeUrl,
  clearPkce,
  exchangeCodeForToken,
  loadPkce,
  makePkce,
  savePkce,
  setStoredToken
} from '../../../utils/opAuth';
import { getUser } from '../actions';

const StyledButton = styled(Button)`
  width: ${remSize(300)};
`;

const STATUS_COLORS = {
  error: '#c00',
  success: '#2a7',
  info: '#666'
} as const;

type StatusKind = keyof typeof STATUS_COLORS;

const StatusLine = styled.p<{ $kind: StatusKind }>`
  width: ${remSize(300)};
  margin: ${remSize(8)} auto 0;
  font-size: ${remSize(12)};
  color: ${(p) => STATUS_COLORS[p.$kind]};
  text-align: center;
`;

interface OpMessage {
  type: 'op-oauth';
  code?: string | null;
  state?: string | null;
  error?: string | null;
  errorDescription?: string | null;
}

const EDITOR_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : '';

export function OpenProcessingButton() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<{
    kind: StatusKind;
    text: string;
  } | null>(null);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== EDITOR_ORIGIN) return;
      const data = event.data as OpMessage | undefined;
      if (!data || data.type !== 'op-oauth') return;

      if (data.error) {
        setStatus({
          kind: 'error',
          text: `OP error: ${data.error}${
            data.errorDescription ? ` — ${data.errorDescription}` : ''
          }`
        });
        clearPkce();
        return;
      }

      const pkce = loadPkce();
      if (!pkce || !data.code || data.state !== pkce.state) {
        setStatus({ kind: 'error', text: 'State mismatch or missing code.' });
        clearPkce();
        return;
      }

      setStatus({ kind: 'info', text: 'Exchanging code…' });

      exchangeCodeForToken(data.code, pkce.codeVerifier)
        .then(async ({ accessToken }) => {
          setStoredToken(accessToken);
          clearPkce();
          setStatus({ kind: 'info', text: 'Loading your profile…' });
          // Hydrate redux state.user from /api/whoami using the new token,
          // then take the user back into the editor.
          await dispatch(getUser() as any);
          browserHistory.push('/');
        })
        .catch((e: Error) => {
          clearPkce();
          setStatus({ kind: 'error', text: `Exchange error: ${e.message}` });
        });
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [dispatch]);

  async function onClick() {
    setStatus({ kind: 'info', text: 'Opening OpenProcessing…' });
    try {
      const pkce = await makePkce();
      savePkce({ state: pkce.state, codeVerifier: pkce.codeVerifier });
      const popupUrl = buildAuthorizeUrl(pkce);

      const w = 520;
      const h = 720;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      popupRef.current = window.open(
        popupUrl,
        'opLogin',
        `width=${w},height=${h},left=${left},top=${top}`
      );
      if (!popupRef.current) {
        setStatus({
          kind: 'error',
          text: 'Popup blocked. Allow popups for this site and try again.'
        });
      }
    } catch (e) {
      setStatus({
        kind: 'error',
        text: `Init failed: ${(e as Error).message}`
      });
    }
  }

  return (
    <>
      <StyledButton onClick={onClick}>
        Continue with OpenProcessing
      </StyledButton>
      {status && <StatusLine $kind={status.kind}>{status.text}</StatusLine>}
    </>
  );
}
