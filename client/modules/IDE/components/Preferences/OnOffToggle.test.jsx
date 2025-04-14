import React from 'react';
import { render, screen, fireEvent } from '../../../../test-utils';
import OnOffToggle from './OnOffToggle';

describe('OnOffToggle', () => {
  const setValue = jest.fn();

  const subject = (initialValue = false) => {
    const result = render(
      <OnOffToggle
        value={initialValue}
        setValue={setValue}
        name="linewrap"
        translationKey="LineWrap"
      />
    );
    return {
      ...result,
      onButton: screen.getByLabelText('On'),
      offButton: screen.getByLabelText('Off')
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('highlights "On" when value is true', () => {
    const { onButton, offButton } = subject(true);

    expect(onButton).toBeChecked();
    expect(offButton).not.toBeChecked();
  });

  it('highlights "Off" when value is false', () => {
    const { onButton, offButton } = subject(false);

    expect(onButton).not.toBeChecked();
    expect(offButton).toBeChecked();
  });

  it('does nothing when clicking the active value', () => {
    const { onButton } = subject(true);

    fireEvent.click(onButton);

    expect(setValue).not.toHaveBeenCalled();
  });

  it('calls setValue when clicking the inactive value', () => {
    const { offButton } = subject(true);

    fireEvent.click(offButton);

    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenCalledWith(false);

    // Note: the checked state will not change until the `value` prop changes.
  });
});
