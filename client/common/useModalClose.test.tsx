import React from 'react';
import { render, fireEvent } from '../test-utils';
import { useModalClose } from './useModalClose';
import { useKeyDownHandlers } from './useKeyDownHandlers';

jest.mock('./useKeyDownHandlers');

describe('useModalClose', () => {
  let onClose: jest.Mock;

  beforeEach(() => {
    onClose = jest.fn();
    jest.clearAllMocks();
  });

  function TestModal({ handleClose }: { handleClose: () => void }) {
    const ref = useModalClose(handleClose);
    return (
      <div>
        <div data-testid="outside">Outside</div>
        <div
          data-testid="modal"
          ref={ref as React.RefObject<HTMLDivElement>}
          tabIndex={-1}
          style={{ border: '1px solid black' }}
        >
          Modal content
        </div>
      </div>
    );
  }

  function mountComponent() {
    return render(<TestModal handleClose={onClose} />);
  }

  it('calls onClose when clicking outside the modal', () => {
    const { getByTestId } = mountComponent();

    fireEvent.click(getByTestId('outside'));

    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the modal', () => {
    const { getByTestId } = mountComponent();

    fireEvent.click(getByTestId('modal'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('returns a ref that is focused on mount', () => {
    const { getByTestId } = mountComponent();
    const modal = getByTestId('modal');

    expect(document.activeElement).toBe(modal);
  });

  it('calls useKeyDownHandlers with escape handler', () => {
    mountComponent();

    expect(useKeyDownHandlers).toHaveBeenCalledWith({ escape: onClose });
  });
});
