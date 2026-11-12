import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { Request, Response } from 'express';
import {
  hasRecentStepUp,
  requireStepUp,
  STEP_UP_WINDOW_MS
} from '../requireStepUp';

describe('middleware > requireStepUp', () => {
  let request: MockRequest;
  let response: MockResponse;
  let next: jest.Mock;

  const fixedTime = 100000000;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  describe('hasRecentStepUp', () => {
    it('returns false when the session has no step-up marker', () => {
      (request as any).session = {};
      expect(hasRecentStepUp((request as unknown) as Request)).toBe(false);
    });

    it('returns false when there is no session at all', () => {
      expect(hasRecentStepUp((request as unknown) as Request)).toBe(false);
    });

    it('returns false when the step-up is stale', () => {
      (request as any).session = {
        stepUpAt: fixedTime - STEP_UP_WINDOW_MS
      };
      expect(hasRecentStepUp((request as unknown) as Request)).toBe(false);
    });

    it('returns true when the step-up is within the window', () => {
      (request as any).session = {
        stepUpAt: fixedTime - STEP_UP_WINDOW_MS + 1000
      };
      expect(hasRecentStepUp((request as unknown) as Request)).toBe(true);
    });
  });

  describe('requireStepUp', () => {
    it('responds 403 step_up_required without a recent step-up', () => {
      (request as any).session = {};
      requireStepUp(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
      expect(next).not.toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith({
        error: 'step_up_required'
      });
    });

    it('calls next with a recent step-up', () => {
      (request as any).session = { stepUpAt: fixedTime };
      requireStepUp(
        (request as unknown) as Request,
        (response as unknown) as Response,
        next
      );
      expect(next).toHaveBeenCalled();
      expect(response.status).not.toHaveBeenCalled();
    });
  });
});
