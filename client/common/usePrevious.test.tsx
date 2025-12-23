import React from 'react';
import { render, screen } from '../test-utils';
import { usePrevious } from './usePrevious';

function TestComponent({ value }: { value: number }) {
  const prev = usePrevious(value);

  return (
    <div>
      <div>current: {value}</div>
      <div>previous: {prev ?? 'undefined'}</div>
    </div>
  );
}

describe('usePrevious', () => {
  it('should return undefined on first render and previous value after update', () => {
    const { rerender } = render(<TestComponent value={1} />);

    // First render: previous should be undefined
    expect(screen.getByText('current: 1')).toBeInTheDocument();
    expect(screen.getByText('previous: undefined')).toBeInTheDocument();

    // Update value
    rerender(<TestComponent value={2} />);

    // Second render: previous should be 1
    expect(screen.getByText('current: 2')).toBeInTheDocument();
    expect(screen.getByText('previous: 1')).toBeInTheDocument();

    // Update value again
    rerender(<TestComponent value={3} />);

    expect(screen.getByText('current: 3')).toBeInTheDocument();
    expect(screen.getByText('previous: 2')).toBeInTheDocument();
  });
});
