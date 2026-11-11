import { Request, Response } from 'jest-express';
import Collection from '../../../models/collection';
import createCollection from '../createCollection';
import updateCollection from '../updateCollection';

jest.mock('../../../models/collection');

describe('collection field validation', () => {
  let request;
  let response;

  beforeEach(() => {
    request = new Request();
    response = new Response();
    Collection.create = jest.fn();
    Collection.findOneAndUpdate = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
  });

  it('rejects an oversized title when creating a collection', async () => {
    request.user = { _id: 'user-id' };
    request.body = { name: 'n'.repeat(101) };

    await createCollection(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Collection name cannot exceed 100 characters.'
    });
    expect(Collection.create).not.toHaveBeenCalled();
  });

  it('rejects an oversized description when updating a collection', async () => {
    request.user = { _id: 'user-id' };
    request.params = { id: 'collection-id' };
    request.body = { description: 'd'.repeat(501) };

    await updateCollection(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Description cannot exceed 500 characters.'
    });
    expect(Collection.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
