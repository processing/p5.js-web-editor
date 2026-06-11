import { Router } from 'express';

const router = Router();

// Authentication is handled entirely by OpenProcessing. "Sign in with
// OpenProcessing" (which also covers GitHub/Google once those users exist in
// the OP database) runs fully in the browser via PKCE + localStorage. The
// editor server's only OAuth role is hosting the static callback page below —
// it's the registered OAuth redirect_uri target.
//
// The legacy editor-level GitHub/Google passport strategies and their
// /auth/github and /auth/google routes were removed along with the Mongo user
// store; those providers are now reached through OP's own sign-in flow.

// Static landing page for the OP popup. OP redirects the popup here with
// ?code=...&state=...; we postMessage them up to the opener and close.
// The redirect_uri registered with OP must match this exact path.
router.get('/auth/openprocessing/callback', (_req, res) => {
  const editorOrigin = process.env.EDITOR_URL || 'http://localhost:8000';
  // The HTML is self-contained — no external scripts, no framework.
  const html = `<!doctype html>
<meta charset="utf-8">
<title>Signing you in…</title>
<style>
  body { font: 14px system-ui, sans-serif; color: #444; margin: 40px; text-align: center; }
  .err { color: #c00; }
</style>
<p id="msg">Completing sign-in…</p>
<script>
(function () {
  var params = new URLSearchParams(location.search);
  var msg = {
    type: 'op-oauth',
    code: params.get('code'),
    state: params.get('state'),
    error: params.get('error'),
    errorDescription: params.get('error_description')
  };
  var EDITOR_ORIGIN = ${JSON.stringify(editorOrigin)};
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(msg, EDITOR_ORIGIN);
      window.close();
    } else {
      document.getElementById('msg').textContent =
        'No opener window. You can close this tab.';
    }
  } catch (e) {
    document.getElementById('msg').className = 'err';
    document.getElementById('msg').textContent = 'Error: ' + (e && e.message);
  }
})();
</script>`;
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', 'no-store');
  res.send(html);
});

// eslint-disable-next-line import/no-default-export
export default router;
