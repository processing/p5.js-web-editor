import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import {
  reduxRender,
  screen,
  fireEvent,
  act,
  waitFor
} from '../../../test-utils';
import AccountForm from './AccountForm';
import { initialTestState } from '../../../testData/testReduxStore';
import * as actions from '../actions';

const mockStore = configureStore([thunk]);
const store = mockStore(initialTestState);

jest.mock('../actions', () => ({
  ...jest.requireActual('../actions'),
  updateSettings: jest.fn().mockReturnValue(
    (dispatch) =>
      new Promise((resolve) => {
        setTimeout(() => {
          dispatch({ type: 'UPDATE_SETTINGS', payload: {} });
          resolve();
        }, 100);
      })
  )
}));

const subject = () => {
  reduxRender(<AccountForm />, {
    store
  });
};

describe('<AccountForm />', () => {
  it('renders form fields with initial values', () => {
    subject();
    const emailElement = screen.getByRole('textbox', {
      name: /email/i
    });
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveValue('happydog@example.com');

    const userNameElement = screen.getByRole('textbox', {
      name: /username/i
    });
    expect(userNameElement).toBeInTheDocument();
    expect(userNameElement).toHaveValue('happydog');

    const currentPasswordElement = screen.getByLabelText(/current password/i);
    expect(currentPasswordElement).toBeInTheDocument();
    expect(currentPasswordElement).toHaveValue('');

    const newPasswordElement = screen.getByLabelText(/new password/i);
    expect(newPasswordElement).toBeInTheDocument();
    expect(newPasswordElement).toHaveValue('');
  });

  it('handles form submission and calls updateSettings', async () => {
    subject();

    const saveAllSettingsButton = screen.getByRole('button', {
      name: /save all settings/i
    });

    const currentPasswordElement = screen.getByLabelText(/current password/i);
    const newPasswordElement = screen.getByLabelText(/new password/i);

    fireEvent.change(currentPasswordElement, {
      target: {
        value: 'currentPassword'
      }
    });

    fireEvent.change(newPasswordElement, {
      target: {
        value: 'newPassword'
      }
    });

    await act(async () => {
      fireEvent.click(saveAllSettingsButton);
    });

    await waitFor(() => {
      expect(actions.updateSettings).toHaveBeenCalledTimes(1);
    });
  });

  it('Save all setting button should get disabled while submitting and enable when not submitting', async () => {
    subject();

    const saveAllSettingsButton = screen.getByRole('button', {
      name: /save all settings/i
    });

    const currentPasswordElement = screen.getByLabelText(/current password/i);
    const newPasswordElement = screen.getByLabelText(/new password/i);

    fireEvent.change(currentPasswordElement, {
      target: {
        value: 'currentPassword'
      }
    });

    fireEvent.change(newPasswordElement, {
      target: {
        value: 'newPassword'
      }
    });
    expect(saveAllSettingsButton).not.toHaveAttribute('disabled');

    await act(async () => {
      fireEvent.click(saveAllSettingsButton);
      await waitFor(() => {
        expect(saveAllSettingsButton).toHaveAttribute('disabled');
      });
    });
  });
});
