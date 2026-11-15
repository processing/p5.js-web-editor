import React from 'react';
import { fireEvent, reduxRender, screen } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';
import CollectionMetadata from './CollectionMetadata';

describe('<CollectionMetadata />', () => {
  it('limits title and description edits and communicates their lengths', () => {
    const collection = {
      id: 'collection-1',
      name: 'My collection',
      description: 'A collection description',
      owner: { username: initialTestState.user.username },
      items: []
    };

    const { container } = reduxRender(
      <CollectionMetadata collectionId={collection.id} />,
      {
        initialState: {
          ...initialTestState,
          collections: [collection]
        }
      }
    );

    const inputs = container.querySelectorAll('.editable-input__input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute('maxLength', '100');
    expect(inputs[1]).toHaveAttribute('maxLength', '500');

    fireEvent.click(
      container.querySelector(
        '.collection-metadata__description .editable-input__label'
      )
    );

    expect(screen.getByText('24/500 characters')).toBeInTheDocument();
  });
});
