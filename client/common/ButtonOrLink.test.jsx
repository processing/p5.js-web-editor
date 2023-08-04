import React from 'react';
import { browserHistory, Route, Router } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from '../store';
import { render, screen, fireEvent, waitFor } from '../test-utils';
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
    const store = configureStore();
    render(
      <Provider store={store}>
        <Router
          history={browserHistory}
          routes={
            <Route
              path="/"
              component={() => <ButtonOrLink href="/about">About</ButtonOrLink>}
            />
          }
        />
      </Provider>
    );

    const link = screen.getByText('About');
    fireEvent.click(link);
    await waitFor(() =>
      expect(browserHistory.getCurrentLocation()).toEqual(
        expect.objectContaining({ pathname: '/about' })
      )
    );
  });
});
