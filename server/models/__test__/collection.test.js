import Collection from '../collection';

describe('models/collection', () => {
  it('accepts a name and description at their maximum lengths', () => {
    const collection = new Collection({
      name: 'n'.repeat(100),
      description: 'd'.repeat(500)
    });

    expect(collection.validateSync()).toBeUndefined();
  });

  it('rejects a name longer than 100 characters', () => {
    const collection = new Collection({
      name: 'n'.repeat(101)
    });

    expect(collection.validateSync().errors.name).toBeDefined();
  });

  it('rejects a description longer than 500 characters', () => {
    const collection = new Collection({
      description: 'd'.repeat(501)
    });

    expect(collection.validateSync().errors.description).toBeDefined();
  });
});
