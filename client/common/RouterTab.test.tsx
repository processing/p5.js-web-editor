import React from 'react';
import { render, screen, fireEvent, waitFor, history } from '../test-utils';
import { RouterTab } from './RouterTab';

const mockPath = '/projects';
const mockLinkText = 'Projects';

describe('RouterTab', () => {
  function mountComponent() {
    return render(<RouterTab to={mockPath}>{mockLinkText}</RouterTab>);
  }

  it('renders a react-router NavLink with correct text and path', async () => {
    mountComponent();

    const linkElement = screen.getByText(mockLinkText);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute('href')).toBe(mockPath);

    fireEvent.click(linkElement);
    await waitFor(() => expect(history.location.pathname).toEqual('/projects'));
  });

  it('includes the dashboard-header class names', () => {
    const { container } = mountComponent();

    const listItem = container.querySelector('li');
    const link = container.querySelector('a');

    expect(listItem).toHaveClass('dashboard-header__tab');
    expect(link).toHaveClass('dashboard-header__tab__title');
  });
});
