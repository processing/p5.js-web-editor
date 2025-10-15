import React from 'react';
import { render, screen, fireEvent } from '../test-utils';
import { Button } from './Button';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('Button', () => {
  // Tag
  it('renders as an anchor when href is provided', () => {
    render(<Button href="https://example.com">Link</Button>);
    const anchor = screen.getByRole('link');
    expect(anchor.tagName.toLowerCase()).toBe('a');
    expect(anchor).toHaveAttribute('href', 'https://example.com');
  });

  it('renders as a React Router <Link> when `to` is provided', () => {
    render(<Button to="/dashboard">Go</Button>);
    const link = screen.getByRole('link');
    expect(link.tagName.toLowerCase()).toBe('a'); // Link renders as <a>
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders as a <button> with a type of "button" by default', () => {
    render(<Button>Click Me</Button>);
    const el = screen.getByRole('button');
    expect(el.tagName.toLowerCase()).toBe('button');
    expect(el).toHaveAttribute('type', 'button');
  });

  // Children & Icons
  it('renders children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders an iconBefore and button text', () => {
    render(
      <Button iconBefore={<MockIcon aria-label="iconbefore" />}>
        This has a before icon
      </Button>
    );
    expect(screen.getByLabelText('iconbefore')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent(
      'This has a before icon'
    );
  });

  it('renders with iconAfter', () => {
    render(
      <Button iconAfter={<MockIcon aria-label="iconafter" />}>
        This has an after icon
      </Button>
    );
    expect(screen.getByLabelText('iconafter')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent(
      'This has an after icon'
    );
  });

  it('renders only the icon if iconOnly', () => {
    render(
      <Button iconAfter={<MockIcon aria-label="iconafter" />} iconOnly>
        This has an after icon
      </Button>
    );
    expect(screen.getByLabelText('iconafter')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveTextContent(
      'This has an after icon'
    );
  });

  // HTML attributes
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('uses aria-label when provided', () => {
    render(<Button aria-label="Upload" iconOnly />);
    expect(screen.getByLabelText('Upload')).toBeInTheDocument();
  });
});
