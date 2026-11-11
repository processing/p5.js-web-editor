import validateCollectionFields from '../validateCollectionFields';

describe('validateCollectionFields', () => {
  it('accepts names and descriptions at their maximum lengths', () => {
    expect(
      validateCollectionFields({
        name: 'n'.repeat(100),
        description: 'd'.repeat(500)
      })
    ).toBeNull();
  });

  it('rejects names longer than 100 characters', () => {
    expect(
      validateCollectionFields({
        name: 'n'.repeat(101)
      })
    ).toBe('Collection name cannot exceed 100 characters.');
  });

  it('rejects descriptions longer than 500 characters', () => {
    expect(
      validateCollectionFields({
        description: 'd'.repeat(501)
      })
    ).toBe('Description cannot exceed 500 characters.');
  });

  it('accepts patches that do not include either field', () => {
    expect(validateCollectionFields({ slug: 'my_collection' })).toBeNull();
  });
});
