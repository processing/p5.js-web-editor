import React from 'react';
import { fireEvent, reduxRender, screen } from '../../../test-utils';
import CollectionCreate from './CollectionCreate';

describe('<CollectionCreate />', () => {
  it('communicates and enforces the title and description limits', () => {
    reduxRender(<CollectionCreate />);

    const nameInput = screen.getByLabelText('name');
    const descriptionInput = screen.getByLabelText('description');

    expect(nameInput).toHaveAttribute('maxLength', '100');
    expect(descriptionInput).toHaveAttribute('maxLength', '500');
    expect(screen.getByText(/\d+\/100 characters/)).toBeInTheDocument();
    expect(screen.getByText('0/500 characters')).toBeInTheDocument();

    fireEvent.change(descriptionInput, {
      target: { value: 'd'.repeat(501) }
    });

    expect(screen.getByText('501/500 characters')).toBeInTheDocument();
    expect(
      screen.getByText('Description must be 500 characters or fewer.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create collection' })
    ).toBeDisabled();
  });
});
