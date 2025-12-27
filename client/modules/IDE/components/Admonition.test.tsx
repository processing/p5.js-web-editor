import React from 'react';
import { render, screen } from '../../../test-utils';
import { Admonition } from './Admonition';

describe('Admonition', () => {
  it('renders the title', () => {
    render(<Admonition title="Important" />);
    expect(screen.getByText('Important')).toBeVisible();
  });

  it('renders children', () => {
    render(
      <Admonition title="Warning">
        <span>Be careful!</span>
      </Admonition>
    );
    expect(screen.getByText('Be careful!')).toBeVisible();
  });
});
