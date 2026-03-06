import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { DropdownMenu, DropdownMenuAlignment } from './DropdownMenu';

describe('DropdownMenu', () => {
  const renderDropdown = () => {
    render(
      <DropdownMenu aria-label="More options" align={DropdownMenuAlignment.RIGHT}>
        <li role="menuitem">Item One</li>
        <li role="menuitem">Item Two</li>
        <li role="menuitem">Item Three</li>
      </DropdownMenu>
    );
  };

  it('should render the dropdown button', () => {
    renderDropdown();

    const button = screen.getByRole('button', { name: 'More options' });
    expect(button).toBeInTheDocument();
  });

  it('should open the dropdown menu when button is clicked', () => {
    renderDropdown();

    const button = screen.getByRole('button', { name: 'More options' });

    fireEvent.click(button);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('should render menu items when opened', () => {
    renderDropdown();

    const button = screen.getByRole('button', { name: 'More options' });
    fireEvent.click(button);

    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
    expect(screen.getByText('Item Three')).toBeInTheDocument();
  });

  it('should close the menu after selecting an item', async () => {
    renderDropdown();

    const button = screen.getByRole('button', { name: 'More options' });
    fireEvent.click(button);

    const item = screen.getByText('Item One');
    fireEvent.mouseUp(item);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('should support custom alignment', () => {
    render(
      <DropdownMenu
        aria-label="Aligned dropdown"
        align={DropdownMenuAlignment.LEFT}
      >
        <li role="menuitem">Left Item</li>
      </DropdownMenu>
    );

    const button = screen.getByRole('button', { name: 'Aligned dropdown' });

    fireEvent.click(button);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });
});
