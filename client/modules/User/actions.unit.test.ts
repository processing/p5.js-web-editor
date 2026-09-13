// @ts-ignore
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { FORM_ERROR } from 'final-form';
import * as UserActions from './actions';
import * as ActionTypes from '../../constants';
import { apiClient } from '../../utils/apiClient';
import browserHistory from '../../browserHistory';
import { initialTestState } from '../../testData/testReduxStore';

const mockStore = configureStore([thunk]);

describe('User actions unit tests', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore(initialTestState);
    jest.clearAllMocks();
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('validateAndSignUpUser', () => {
    const formValues = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    };

    it('handles successful signup', async () => {
      const mockUserData = {
        id: 'u123',
        username: 'newuser',
        email: 'newuser@example.com'
      };
      jest
        .spyOn(apiClient, 'post')
        .mockResolvedValueOnce({ data: mockUserData });
      const pushSpy = jest
        .spyOn(browserHistory, 'push')
        .mockImplementation(() => {});

      const result = await store.dispatch(
        UserActions.validateAndSignUpUser(formValues)
      );

      expect(result).toBeUndefined();
      expect(pushSpy).toHaveBeenCalledWith('/');
      const actions = store.getActions();
      expect(actions).toContainEqual(
        UserActions.authenticateUser(mockUserData as any)
      );
      expect(actions).toContainEqual(
        expect.objectContaining({ type: ActionTypes.JUST_OPENED_PROJECT })
      );
    });

    it('handles server validation/API error gracefully (with error.response)', async () => {
      const apiError = {
        response: {
          data: { error: 'Username is in use' },
          status: 422
        }
      };
      jest.spyOn(apiClient, 'post').mockRejectedValueOnce(apiError);

      const result = await store.dispatch(
        UserActions.validateAndSignUpUser(formValues)
      );

      expect(result).toEqual({ error: apiError });
      expect(store.getActions()).toContainEqual({
        type: ActionTypes.AUTH_ERROR,
        payload: 'Username is in use'
      });
    });

    it('handles network error where error.response is undefined without throwing or hanging', async () => {
      const networkError = new Error('Network Error');
      jest.spyOn(apiClient, 'post').mockRejectedValueOnce(networkError);

      const result = await store.dispatch(
        UserActions.validateAndSignUpUser(formValues)
      );

      expect(result).toEqual({ error: networkError });
      expect(store.getActions()).toContainEqual({
        type: ActionTypes.AUTH_ERROR,
        payload: 'Network Error'
      });
    });
  });

  describe('validateAndLoginUser', () => {
    const loginValues = {
      email: 'user@example.com',
      password: 'password123'
    };

    it('handles network error where error.response is undefined', async () => {
      const networkError = new Error('Network Error');
      jest.spyOn(apiClient, 'post').mockRejectedValueOnce(networkError);

      const result = await store.dispatch(
        UserActions.validateAndLoginUser(loginValues)
      );

      expect(result).toEqual({
        [FORM_ERROR]: 'Network Error'
      });
    });
  });

  describe('logoutUser', () => {
    it('handles network error where error.response is undefined', async () => {
      const networkError = new Error('Network Error');
      jest.spyOn(apiClient, 'get').mockRejectedValueOnce(networkError);

      await store.dispatch(UserActions.logoutUser());

      expect(store.getActions()).toContainEqual({
        type: ActionTypes.AUTH_ERROR,
        payload: 'Network Error'
      });
    });
  });
});
