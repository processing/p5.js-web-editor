import React from 'react';
import { render, screen, fireEvent, waitFor, history } from '../test-utils';
import ButtonOrLink from './ButtonOrLink';

describe('ButtonOrLink', () => {
  const clickHandler = jest.fn();

  afterEach(() => {
    clickHandler.mockClear();
  });

  it('can render a clickable button', () => {
    render(<ButtonOrLink onClick={clickHandler}>Text</ButtonOrLink>);
    const button = screen.getByRole('button');
    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button).toContainHTML('<button>Text</button>');
    fireEvent.click(button);
    expect(clickHandler).toHaveBeenCalled();
  });

  it('can render an external link', () => {
    render(<ButtonOrLink href="https://p5js.org">p5</ButtonOrLink>);
    const link = screen.getByRole('link');
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link).toHaveAttribute('href', 'https://p5js.org');
  });

  it('can render an internal link with react-router', async () => {
    render(<ButtonOrLink href="/about">About</ButtonOrLink>);

    const link = screen.getByText('About');
    fireEvent.click(link);

    await waitFor(() => expect(history.location.pathname).toEqual('/about'));
  });
});
