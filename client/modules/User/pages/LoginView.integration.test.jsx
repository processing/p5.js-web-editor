import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { screen, fireEvent, act } from '@testing-library/react';

import { LoginView } from './LoginView';
import { reduxRender, history } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';
import * as actions from '../actions';

const mockStore = configureStore([thunk]);

jest.mock('../actions', () => ({
  ...jest.requireActual('../actions'),
  validateAndLoginUser: jest.fn().mockReturnValue(
    (dispatch) =>
      new Promise((resolve) => {
        dispatch({ type: 'AUTH_USER', payload: {} });
        dispatch({ type: 'SET_PREFERENCES', payload: {} });
        resolve();
      })
  )
}));

jest.mock('../../../common/useSyncFormTranslations', () => ({
  useSyncFormTranslations: jest.fn()
}));

describe('<LoginView /> integration', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialTestState);
    jest.clearAllMocks();
  });

  const renderComponent = () => reduxRender(<LoginView />, { store });

  it('renders page heading, login form, social auth buttons, and navigation links', () => {
    renderComponent();

    // Verify main page title and divider
    expect(
      screen.getByRole('heading', { name: /log in/i, level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /^or$/i, level: 2 })
    ).toBeInTheDocument();

    // Verify embedded LoginForm fields
    expect(
      screen.getByRole('textbox', { name: /email or username/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();

    // Verify social authentication buttons
    const githubButton = screen.getByRole('link', { name: /github/i });
    expect(githubButton).toBeInTheDocument();
    expect(githubButton).toHaveAttribute('href', '/auth/github');

    const googleButton = screen.getByRole('link', { name: /google/i });
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveAttribute('href', '/auth/google');

    // Verify navigation links for signup and reset-password
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');

    const resetPasswordLink = screen.getByRole('link', {
      name: /reset your password/i
    });
    expect(resetPasswordLink).toBeInTheDocument();
    expect(resetPasswordLink).toHaveAttribute('href', '/reset-password');
  });

  it('navigates to the signup page when the sign up link is clicked', () => {
    renderComponent();

    const signupLink = screen.getByRole('link', { name: /sign up/i });
    fireEvent.click(signupLink);

    expect(history.location.pathname).toBe('/signup');
  });

  it('navigates to the reset password page when the reset password link is clicked', () => {
    renderComponent();

    const resetPasswordLink = screen.getByRole('link', {
      name: /reset your password/i
    });
    fireEvent.click(resetPasswordLink);

    expect(history.location.pathname).toBe('/reset-password');
  });

  it('integrates with LoginForm and submits user credentials', async () => {
    renderComponent();

    const emailInput = screen.getByRole('textbox', {
      name: /email or username/i
    });
    fireEvent.change(emailInput, {
      target: { value: 'testuser@example.com' }
    });

    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(actions.validateAndLoginUser).toHaveBeenCalledWith({
      email: 'testuser@example.com',
      password: 'password123'
    });
  });
});
