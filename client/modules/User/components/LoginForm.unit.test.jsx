import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import LoginForm from './LoginForm';
import * as actions from '../actions';
import { initialTestState } from '../../../testData/testReduxStore';
import { reduxRender, screen, fireEvent, act } from '../../../test-utils';

const mockStore = configureStore([thunk]);
const store = mockStore(initialTestState);

jest.mock('../actions', () => ({
  ...jest.requireActual('../actions'),
  validateAndLoginUser: jest.fn().mockReturnValue(
    (dispatch) =>
      new Promise((resolve) => {
        setTimeout(() => {
          dispatch({ type: 'AUTH_USER', payload: {} });
          dispatch({ type: 'SET_PREFERENCES', payload: {} });
          resolve();
        }, 100);
      })
  )
}));

jest.mock('../../../common/useSyncFormTranslations', () => ({
  useSyncFormTranslations: jest.fn()
}));

const subject = () => {
  reduxRender(<LoginForm />, {
    store
  });
};

describe('<LoginForm/>', () => {
  test('Renders form with the correct fields.', () => {
    subject();
    const emailTextElement = screen.getByText(/email or username/i);
    expect(emailTextElement).toBeInTheDocument();

    const emailInputElement = screen.getByRole('textbox', {
      name: /email or username/i
    });
    expect(emailInputElement).toBeInTheDocument();

    const passwordTextElement = screen.getByText(/password/i);
    expect(passwordTextElement).toBeInTheDocument();

    const passwordInputElement = screen.getByLabelText(/password/i);
    expect(passwordInputElement).toBeInTheDocument();

    const loginButtonElement = screen.getByRole('button', {
      name: /log in/i
    });
    expect(loginButtonElement).toBeInTheDocument();
  });
  test('Validate and login user is called with the correct values.', async () => {
    subject();

    const emailElement = screen.getByRole('textbox', {
      name: /email or username/i
    });
    fireEvent.change(emailElement, {
      target: {
        value: 'correctuser@gmail.com'
      }
    });

    const passwordElement = screen.getByLabelText(/password/i);

    fireEvent.change(passwordElement, {
      target: {
        value: 'correctpassword'
      }
    });

    const loginButton = screen.getByRole('button', {
      name: /log in/i
    });
    await act(async () => {
      fireEvent.click(loginButton);
    });

    expect(actions.validateAndLoginUser).toHaveBeenCalledWith({
      email: 'correctuser@gmail.com',
      password: 'correctpassword'
    });
  });
});
