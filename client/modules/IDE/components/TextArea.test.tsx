import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import { TextArea } from './TextArea';
import { showToast } from '../actions/toast';

jest.mock('../actions/toast', () => ({
  showToast: jest.fn(() => ({ type: 'SHOW_TOAST' }))
}));

describe('TextArea', () => {
  const defaultProps = {
    src: 'const x = 10;',
    className: 'custom-class'
  };

  it('renders the source text', () => {
    render(<TextArea {...defaultProps} />);
    expect(screen.getByDisplayValue('const x = 10;')).toBeInTheDocument();
  });

  it('copies text to clipboard when copy button is clicked', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, {
      clipboard: mockClipboard
    });

    render(<TextArea {...defaultProps} />);
    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith('const x = 10;');
    await waitFor(() => {
      expect(showToast).toHaveBeenCalled();
    });
  });
});
