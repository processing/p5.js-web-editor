import { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from '../isAuthenticated';

describe('isAuthenticated middleware', () => {
  it('should call next() if user property is present', () => {
    const req = ({ user: 'any_user' } as unknown) as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if user is missing', () => {
    const req = { headers: {} } as Request;
    const res = ({
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown) as Response;
    const next = jest.fn() as NextFunction;

    isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: 'You must be logged in in order to perform the requested action.'
    });
  });
});
