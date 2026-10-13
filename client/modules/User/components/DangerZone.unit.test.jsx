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
import { initialTestState } from '../../../testData/testReduxStore';
import { DangerZone } from './DangerZone';
import * as actions from '../actions';

const mockStore = configureStore([thunk]);

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

jest.mock('../actions', () => ({
  ...jest.requireActual('../actions'),
  deleteAccount: jest.fn()
}));

const storeWithPassword = mockStore({
  ...initialTestState,
  user: {
    ...initialTestState.user,
    github: undefined,
    google: undefined
  }
});

const storeWithSocialOnly = mockStore({
  ...initialTestState,
  user: {
    ...initialTestState.user,
    github: 'gh_user',
    google: undefined
  }
});

const renderWithPassword = () =>
  reduxRender(<DangerZone />, { store: storeWithPassword });

const renderWithSocial = () =>
  reduxRender(<DangerZone />, { store: storeWithSocialOnly });

describe('<DangerZone />', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    jest.clearAllMocks();
  });

  describe('initial render', () => {
    it('renders the Danger Zone heading', () => {
      renderWithPassword();
      expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
    });

    it('renders the description text', () => {
      renderWithPassword();
      expect(
        screen.getByText(/permanently delete your account/i)
      ).toBeInTheDocument();
    });

    it('renders the Delete Account button', () => {
      renderWithPassword();
      expect(
        screen.getByRole('button', { name: /delete account/i })
      ).toBeInTheDocument();
    });

    it('does not show the confirmation form initially', () => {
      renderWithPassword();
      expect(
        screen.queryByRole('button', { name: /permanently delete account/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('when Delete Account is clicked', () => {
    beforeEach(async () => {
      renderWithPassword();
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
    });

    it('shows the password field for users with a password', () => {
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('shows the Permanently Delete Account confirm button', () => {
      expect(
        screen.getByRole('button', { name: /permanently delete account/i })
      ).toBeInTheDocument();
    });

    it('shows the Cancel button', () => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it('confirm button is disabled when password field is empty', () => {
      expect(
        screen.getByRole('button', { name: /permanently delete account/i })
      ).toBeDisabled();
    });

    it('confirm button becomes enabled once password is typed', async () => {
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'somepassword' }
      });
      expect(
        screen.getByRole('button', { name: /permanently delete account/i })
      ).not.toBeDisabled();
    });
  });

  describe('when user has only social logins (no password)', () => {
    beforeEach(async () => {
      renderWithSocial();
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
    });

    it('does not show a password field', () => {
      expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    });

    it('confirm button is enabled immediately (no password required)', () => {
      expect(
        screen.getByRole('button', { name: /permanently delete account/i })
      ).not.toBeDisabled();
    });

    it('calls deleteAccount with an empty password object', async () => {
      actions.deleteAccount.mockReturnValue(() => Promise.resolve(undefined));
      mockDispatch.mockImplementation((thunkOrAction) => {
        if (typeof thunkOrAction === 'function') {
          return thunkOrAction(mockDispatch);
        }
        return Promise.resolve();
      });
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /permanently delete account/i })
        );
      });
      expect(actions.deleteAccount).toHaveBeenCalledWith({});
    });
  });

  describe('when Cancel is clicked', () => {
    beforeEach(async () => {
      renderWithPassword();
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'mypassword' }
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      });
    });

    it('returns to the initial view', () => {
      expect(
        screen.getByRole('button', { name: /delete account/i })
      ).toBeInTheDocument();
    });

    it('hides the confirm button', () => {
      expect(
        screen.queryByRole('button', { name: /permanently delete account/i })
      ).not.toBeInTheDocument();
    });

    it('clears the password field on cancel', async () => {
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
      expect(screen.getByLabelText(/password/i)).toHaveValue('');
    });

    it('clears the error message on cancel', async () => {
      actions.deleteAccount.mockReturnValue(() =>
        Promise.resolve('Invalid password.')
      );
      mockDispatch.mockImplementation((thunkOrAction) => {
        if (typeof thunkOrAction === 'function') {
          return thunkOrAction(mockDispatch);
        }
        return Promise.resolve();
      });
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'bad' }
      });
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /permanently delete account/i })
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      });
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
      expect(screen.queryByText('Invalid password.')).not.toBeInTheDocument();
    });
  });

  describe('when confirming deletion succeeds', () => {
    beforeEach(async () => {
      actions.deleteAccount.mockReturnValue(() => Promise.resolve(undefined));
      mockDispatch.mockImplementation((thunkOrAction) => {
        if (typeof thunkOrAction === 'function') {
          return thunkOrAction(mockDispatch);
        }
        return Promise.resolve();
      });

      renderWithPassword();
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'correctpassword' }
      });
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /permanently delete account/i })
        );
      });
    });

    it('calls deleteAccount with the entered password', () => {
      expect(actions.deleteAccount).toHaveBeenCalledWith({
        password: 'correctpassword'
      });
    });

    it('does not show an error message', () => {
      expect(
        screen.queryByRole('paragraph', { name: /error/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('when confirming deletion fails', () => {
    const errorMessage = 'Invalid password.';

    beforeEach(async () => {
      actions.deleteAccount.mockReturnValue(() =>
        Promise.resolve(errorMessage)
      );
      mockDispatch.mockImplementation((thunkOrAction) => {
        if (typeof thunkOrAction === 'function') {
          return thunkOrAction(mockDispatch);
        }
        return Promise.resolve();
      });

      renderWithPassword();
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' }
      });
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /permanently delete account/i })
        );
      });
    });

    it('displays the error message returned by the server', async () => {
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('calls deleteAccount with the typed password', () => {
      expect(actions.deleteAccount).toHaveBeenCalledWith({
        password: 'wrongpassword'
      });
    });
  });

  describe('while submission is in progress', () => {
    beforeEach(async () => {
      actions.deleteAccount.mockReturnValue(() => new Promise(() => {}));
      mockDispatch.mockImplementation((thunkOrAction) => {
        if (typeof thunkOrAction === 'function') {
          return thunkOrAction(mockDispatch);
        }
        return Promise.resolve();
      });

      renderWithPassword();
      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /delete account/i })
        );
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'somepassword' }
      });
      act(() => {
        fireEvent.click(
          screen.getByRole('button', { name: /permanently delete account/i })
        );
      });
    });

    it('disables the confirm button while submitting', () => {
      expect(
        screen.getByRole('button', { name: /permanently delete account/i })
      ).toBeDisabled();
    });

    it('disables the cancel button while submitting', () => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });
});
