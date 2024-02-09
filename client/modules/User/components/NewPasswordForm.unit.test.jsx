import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { fireEvent } from '@storybook/testing-library';
import { reduxRender, screen, act, waitFor } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';
import NewPasswordForm from './NewPasswordForm';

const mockStore = configureStore([thunk]);
const store = mockStore(initialTestState);

const mockResetPasswordToken = 'mockResetToken';
const subject = () => {
  reduxRender(<NewPasswordForm resetPasswordToken={mockResetPasswordToken} />, {
    store
  });
};
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

jest.mock('../../../utils/reduxFormUtils', () => ({
  validateNewPassword: jest.fn()
}));

jest.mock('../actions', () => ({
  updatePassword: jest.fn().mockReturnValue(
    new Promise((resolve) => {
      resolve();
    })
  )
}));

describe('<NewPasswordForm/>', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    jest.clearAllMocks();
  });
  test('renders form fields correctly', () => {
    subject();

    const passwordInputElements = screen.getAllByLabelText(/Password/i);
    expect(passwordInputElements).toHaveLength(2);

    const passwordInputElement = passwordInputElements[0];
    expect(passwordInputElement).toBeInTheDocument();

    const confirmPasswordInputElement = passwordInputElements[1];
    expect(confirmPasswordInputElement).toBeInTheDocument();

    const submitElemement = screen.getByRole('button', {
      name: /set new password/i
    });
    expect(submitElemement).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    subject();
    const passwordInputElements = screen.getAllByLabelText(/Password/i);

    const passwordInputElement = passwordInputElements[0];
    fireEvent.change(passwordInputElement, {
      target: { value: 'password123' }
    });

    const confirmPasswordInputElement = passwordInputElements[1];
    fireEvent.change(confirmPasswordInputElement, {
      target: { value: 'password123' }
    });

    const submitElemement = screen.getByRole('button', {
      name: /set new password/i
    });

    await act(async () => {
      fireEvent.click(submitElemement);
    });

    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
  });
});
