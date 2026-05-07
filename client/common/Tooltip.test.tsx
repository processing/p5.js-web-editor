import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders the child element', () => {
    render(
      <Tooltip content="This is a tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show the tooltip when the user is not hovering over the element', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Button</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveClass('tooltipped-visible');
  });

  it('shows the tooltip if the user hovers over the element', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip text">
        <button>Button</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    await user.hover(button);

    expect(button).toHaveClass('tooltipped');
    expect(button).toHaveAttribute('aria-label', 'Tooltip text');
  });

  it('adds the aria-label with tooltip content to the child element', () => {
    render(
      <Tooltip content="Save your changes">
        <button>Save</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Save your changes');
  });

  it('applies tooltipped-no-delay class when noDelay is true', () => {
    render(
      <Tooltip content="No delay tooltip" noDelay>
        <button>Button</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('tooltipped-no-delay');
  });

  it('does not apply tooltipped-no-delay class when noDelay is false', () => {
    render(
      <Tooltip content="Normal tooltip" noDelay={false}>
        <button>Button</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('tooltipped-no-delay');
  });

  it('preserves existing className on the child element', () => {
    render(
      <Tooltip content="Tooltip">
        <button className="custom-class">Button</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('tooltipped');
  });

  it('wraps the child in a tooltip-wrapper span', () => {
    const { container } = render(
      <Tooltip content="Tooltip">
        <button>Button</button>
      </Tooltip>
    );

    const wrapper = container.querySelector('.tooltip-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.tagName.toLowerCase()).toBe('span');
  });
});
