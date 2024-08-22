import React from 'react';

import { render, screen } from '../../../test-utils';

import ErrorModal from './ErrorModal';

jest.mock('../../../i18n');

describe('<ErrorModal />', () => {
  it('renders type forceAuthentication', () => {
    render(
      <ErrorModal
        type="forceAuthentication"
        closeModal={jest.fn()}
        service="google"
      />
    );

    expect(screen.getByText('Login')).toBeVisible();
    expect(screen.getByText('Sign Up')).toBeVisible();
  });

  it('renders type staleSession', () => {
    render(
      <ErrorModal type="staleSession" closeModal={jest.fn()} service="google" />
    );

    expect(screen.getByText('log in')).toBeVisible();
  });

  it('renders type staleProject', () => {
    render(
      <ErrorModal type="staleProject" closeModal={jest.fn()} service="google" />
    );

    expect(
      screen.getByText(
        'The project you have attempted to save has been saved from another window',
        { exact: false }
      )
    ).toBeVisible();
  });

  it('renders type oauthError with service google', () => {
    render(
      <ErrorModal type="oauthError" service="google" closeModal={jest.fn()} />
    );

    expect(
      screen.getByText('There was a problem linking your Google account', {
        exact: false
      })
    ).toBeVisible();
  });

  it('renders type oauthError with service github', () => {
    render(
      <ErrorModal type="oauthError" service="github" closeModal={jest.fn()} />
    );

    expect(
      screen.getByText('There was a problem linking your GitHub account', {
        exact: false
      })
    ).toBeVisible();
  });
});
