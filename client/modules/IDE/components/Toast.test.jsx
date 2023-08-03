import React from 'react';
import {
  act,
  reduxRender,
  screen,
  fireEvent,
  waitFor
} from '../../../test-utils';
import { setToastText, showToast } from '../actions/toast';
import Toast from './Toast';

// TODO: update action calls after reducer refactor is merged.

describe(`Toast`, () => {
  it('is hidden by default', () => {
    reduxRender(<Toast />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('opens when an action is dispatched', async () => {
    const { store } = reduxRender(<Toast />);
    act(() => {
      store.dispatch(showToast(1500));
      store.dispatch(setToastText('Toast.SketchSaved'));
    });

    const toast = screen.queryByRole('status');
    expect(toast).toBeVisible();
    expect(toast).toHaveTextContent('Sketch saved.');
  });

  it('closes automatically after time', async () => {
    const { store } = reduxRender(<Toast />);
    act(() => {
      store.dispatch(showToast(100));
      store.dispatch(setToastText('Toast.SketchSaved'));
    });

    expect(screen.queryByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('closes when "X" button is pressed', () => {
    reduxRender(<Toast />, {
      initialState: { toast: { isVisible: true, text: 'Hello World' } }
    });
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
