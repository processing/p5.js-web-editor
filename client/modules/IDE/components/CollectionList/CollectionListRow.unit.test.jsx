import React from 'react';
import { fireEvent, reduxRender, screen } from '../../../../test-utils';
import CollectionListRow from './CollectionListRow';

describe('<CollectionListRow />', () => {
  it('limits collection renames and shows the character count', () => {
    const editCollection = jest.fn();
    const collection = {
      id: 'collection-1',
      name: 'My collection',
      owner: { username: 'testuser' },
      createdAt: '2026-01-15T10:30:00.000Z',
      updatedAt: '2026-01-15T10:30:00.000Z',
      items: []
    };

    reduxRender(
      <table>
        <tbody>
          <CollectionListRow
            collection={collection}
            user={{ username: 'testuser', authenticated: true }}
            username="testuser"
            editCollection={editCollection}
            deleteCollection={jest.fn()}
            onAddSketches={jest.fn()}
          />
        </tbody>
      </table>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Toggle Open/Close collection options'
      })
    );
    fireEvent.click(screen.getByText('Rename'));

    const renameInput = screen.getByRole('textbox', { name: 'Rename' });
    expect(renameInput).toHaveAttribute('maxLength', '100');
    expect(screen.getByText('13/100 characters')).toBeInTheDocument();

    fireEvent.change(renameInput, {
      target: { value: 'n'.repeat(101) }
    });
    fireEvent.keyDown(renameInput, { key: 'Enter' });

    expect(
      screen.getByText('Collection name must be 100 characters or fewer.')
    ).toBeInTheDocument();
    expect(editCollection).not.toHaveBeenCalled();
  });
});
