import { apiClient } from '../../utils/apiClient';

/**
 * Client-side helper for step-up re-authentication.
 *
 * Sensitive actions (email/password change, OAuth unlink, API key creation,
 * OAuth linking) require a recent step-up. The server keeps the timestamp in
 * the session and returns 403 { error: 'step_up_required' } when it is
 * missing. The client opens a modal, verifies, then retries once.
 */

export const STEP_UP_REQUIRED_ERROR = 'step_up_required';

let stepUpExpiresAt: number | null = null;

type StepUpRequester = () => Promise<boolean>;

let requester: StepUpRequester | null = null;

export function registerStepUpRequester(fn: StepUpRequester | null) {
  requester = fn;
}

export function setStepUpExpiry(expiresAt: number) {
  stepUpExpiresAt = expiresAt;
}

export function clearStepUpExpiry() {
  stepUpExpiresAt = null;
}

export function isStepUpValid(): boolean {
  return typeof stepUpExpiresAt === 'number' && Date.now() < stepUpExpiresAt;
}

export function isStepUpRequiredError(error: any): boolean {
  return (
    error?.response?.status === 403 &&
    error?.response?.data?.error === STEP_UP_REQUIRED_ERROR
  );
}

/**
 * Ask the mounted StepUpModal (if any) to verify. Resolves true when the
 * session is stepped-up, false when the user cancels or no modal is mounted.
 */
export function requestStepUp(): Promise<boolean> {
  if (isStepUpValid()) {
    return Promise.resolve(true);
  }
  if (!requester) {
    return Promise.resolve(false);
  }
  return requester();
}

export function verifyStepUpPassword(password: string) {
  return apiClient.post('/account/step-up', { password });
}

export function sendStepUpCode() {
  return apiClient.post('/account/step-up/code', {});
}

export function verifyStepUpCode(code: string) {
  return apiClient.post('/account/step-up', { code });
}
