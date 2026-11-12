import {
  clearStepUpExpiry,
  isStepUpRequiredError,
  isStepUpValid,
  registerStepUpRequester,
  requestStepUp,
  setStepUpExpiry
} from './stepUp';

describe('stepUp service', () => {
  beforeEach(() => {
    clearStepUpExpiry();
    registerStepUpRequester(null);
  });

  it('detects 403 step_up_required errors', () => {
    expect(
      isStepUpRequiredError({
        response: { status: 403, data: { error: 'step_up_required' } }
      })
    ).toBe(true);
    expect(
      isStepUpRequiredError({
        response: { status: 401, data: { error: 'step_up_required' } }
      })
    ).toBe(false);
    expect(
      isStepUpRequiredError({
        response: { status: 403, data: { error: 'other' } }
      })
    ).toBe(false);
    expect(isStepUpRequiredError(new Error('network'))).toBe(false);
  });

  it('tracks expiry', () => {
    expect(isStepUpValid()).toBe(false);
    setStepUpExpiry(Date.now() + 10 * 60 * 1000);
    expect(isStepUpValid()).toBe(true);
    setStepUpExpiry(Date.now() - 1000);
    expect(isStepUpValid()).toBe(false);
  });

  it('resolves true without UI when step-up is still valid', async () => {
    setStepUpExpiry(Date.now() + 10 * 60 * 1000);
    registerStepUpRequester(() => Promise.resolve(false));
    await expect(requestStepUp()).resolves.toBe(true);
  });

  it('delegates to the registered modal requester', async () => {
    registerStepUpRequester(() => Promise.resolve(true));
    await expect(requestStepUp()).resolves.toBe(true);
  });

  it('resolves false when no modal is mounted', async () => {
    await expect(requestStepUp()).resolves.toBe(false);
  });
});
