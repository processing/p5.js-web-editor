import React from 'react';
import { render, screen } from '../test-utils';
import { IconButton } from './IconButton';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('IconButton', () => {
  test('renders with an icon', () => {
    render(<IconButton icon={MockIcon} aria-label="test button" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'test button' })
    ).toBeInTheDocument();
  });

  test('renders without an icon', () => {
    render(<IconButton />);
    expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument();
  });

  test('passes other props to the button', () => {
    render(<IconButton icon={MockIcon} id="my-button" />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'my-button');
  });
});
