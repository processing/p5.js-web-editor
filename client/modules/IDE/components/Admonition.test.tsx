import React from 'react';
import { render, screen } from '@testing-library/react';
import { Admonition } from './Admonition';

describe('Admonition Component', () => {
  it('renders with the correct title', () => {
    render(<Admonition title="Important Note" />);
    expect(screen.getByText('Important Note')).toBeInTheDocument();
  });

  it('renders the children content correctly', () => {
    render(
      <Admonition title="Warning">
        <p>This is a warning message.</p>
      </Admonition>
    );
    expect(screen.getByText('This is a warning message.')).toBeInTheDocument();
  });

  it('renders the title as a bold element', () => {
    const { container } = render(<Admonition title="Bold Title" />);
    const strongElement = container.querySelector('strong');
    expect(strongElement).toHaveTextContent('Bold Title');
  });
});
