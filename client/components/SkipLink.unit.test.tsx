import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  const defaultProps = {
    targetId: 'main-content',
    text: 'goToMain'
  };

  test('renders with correct href and text', () => {
    render(<SkipLink {...defaultProps} />);
    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveTextContent('SkipLink.goToMain');
  });

  test('adds "focus" class on focus and removes it on blur', () => {
    render(<SkipLink {...defaultProps} />);
    const link = screen.getByRole('link');

    expect(link.className).toBe('skip_link');

    fireEvent.focus(link);
    expect(link.className).toContain('focus');

    fireEvent.blur(link);
    expect(link.className).toBe('skip_link');
  });
});
