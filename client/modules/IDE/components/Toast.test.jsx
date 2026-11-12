import React from 'react';
import {
  act,
  reduxRender,
  screen,
  fireEvent,
  waitFor
} from '../../../test-utils';
import { showToast } from '../actions/toast';
import Toast from './Toast';

describe(`Toast`, () => {
  it('is hidden by default, with an empty live region in the page', () => {
    reduxRender(<Toast />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens when an action is dispatched', async () => {
    const { store } = reduxRender(<Toast />);
    const liveRegion = screen.getByRole('status');
    act(() => {
      store.dispatch(showToast('Toast.SketchSaved'));
    });

    // The message is added to the live region that was already in the page
    expect(screen.getByRole('status')).toBe(liveRegion);
    expect(liveRegion).toHaveTextContent('Sketch saved.');
    expect(screen.getByRole('button')).toBeVisible();
  });

  it('closes automatically after time', async () => {
    const { store } = reduxRender(<Toast />);
    act(() => {
      store.dispatch(showToast('Toast.SketchSaved', 100));
    });

    expect(screen.getByRole('status')).toHaveTextContent('Sketch saved.');

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('closes when "X" button is pressed', () => {
    reduxRender(<Toast />, {
      initialState: { toast: { isVisible: true, text: 'Hello World' } }
    });
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
