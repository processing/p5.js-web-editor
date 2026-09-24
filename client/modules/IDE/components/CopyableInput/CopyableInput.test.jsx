import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Clipboard from 'clipboard';
import CopyableInput from './CopyableInput';

// Mock clipboard.js
jest.mock('clipboard');

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

// Mock ShareIcon SVG — must be a function, not a plain object
jest.mock('../../../images/share.svg', () => {
  const ShareIcon = () => <svg data-testid="share-icon" />;
  return ShareIcon;
});

describe('CopyableInput', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 'https://example.com'
  };

  let mockClipboardInstance;

  beforeEach(() => {
    mockClipboardInstance = {
      on: jest.fn(),
      destroy: jest.fn()
    };
    Clipboard.mockImplementation(() => mockClipboardInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<CopyableInput {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders the label text', () => {
      render(<CopyableInput {...defaultProps} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('renders the input with the correct value', () => {
      render(<CopyableInput {...defaultProps} />);
      expect(screen.getByRole('textbox')).toHaveValue('https://example.com');
    });

    it('renders the input as readOnly', () => {
      render(<CopyableInput {...defaultProps} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('associates label with input via htmlFor', () => {
      render(<CopyableInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label').closest('label');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('does not render the preview link by default', () => {
      render(<CopyableInput {...defaultProps} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders the preview link when hasPreviewLink is true', () => {
      render(<CopyableInput {...defaultProps} hasPreviewLink />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', defaultProps.value);
    });

    it('opens the preview link in a new tab', () => {
      render(<CopyableInput {...defaultProps} hasPreviewLink />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // ─── CSS Classes ──────────────────────────────────────────────────────────

  describe('CSS classes', () => {
    it('applies the base copyable-input class', () => {
      const { container } = render(<CopyableInput {...defaultProps} />);
      expect(container.firstChild).toHaveClass('copyable-input');
    });

    it('does not apply the --with-preview modifier by default', () => {
      const { container } = render(<CopyableInput {...defaultProps} />);
      expect(container.firstChild).not.toHaveClass(
        'copyable-input--with-preview'
      );
    });

    it('applies the --with-preview modifier when hasPreviewLink is true', () => {
      const { container } = render(
        <CopyableInput {...defaultProps} hasPreviewLink />
      );
      expect(container.firstChild).toHaveClass('copyable-input--with-preview');
    });

    it('does not apply tooltip class initially', () => {
      render(<CopyableInput {...defaultProps} />);
      const valueContainer = screen
        .getByRole('textbox')
        .closest('.copyable-input__value-container');
      expect(valueContainer).not.toHaveClass('tooltipped');
      expect(valueContainer).not.toHaveClass('tooltipped-n');
    });
  });

  // ─── Clipboard Integration ────────────────────────────────────────────────

  describe('clipboard integration', () => {
    it('initialises Clipboard on mount', () => {
      render(<CopyableInput {...defaultProps} />);
      expect(Clipboard).toHaveBeenCalledTimes(1);
    });

    it('passes the input element as the clipboard target', () => {
      render(<CopyableInput {...defaultProps} />);
      const [, options] = Clipboard.mock.calls[0];
      const input = screen.getByRole('textbox');
      expect(options.target()).toBe(input);
    });

    it('registers a success handler on the clipboard instance', () => {
      render(<CopyableInput {...defaultProps} />);
      expect(mockClipboardInstance.on).toHaveBeenCalledWith(
        'success',
        expect.any(Function)
      );
    });

    it('shows the tooltip after a successful copy', () => {
      render(<CopyableInput {...defaultProps} />);

      const successCallback = mockClipboardInstance.on.mock.calls.find(
        ([event]) => event === 'success'
      )[1];

      act(() => {
        successCallback();
      });

      const valueContainer = screen
        .getByRole('textbox')
        .closest('.copyable-input__value-container');
      expect(valueContainer).toHaveClass('tooltipped');
      expect(valueContainer).toHaveClass('tooltipped-n');
    });

    it('destroys the clipboard instance on unmount', () => {
      const { unmount } = render(<CopyableInput {...defaultProps} />);
      unmount();
      expect(mockClipboardInstance.destroy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Tooltip / Mouse Interactions ─────────────────────────────────────────

  describe('tooltip behaviour', () => {
    it('hides the tooltip on mouse leave after a copy', () => {
      render(<CopyableInput {...defaultProps} />);

      const successCallback = mockClipboardInstance.on.mock.calls.find(
        ([event]) => event === 'success'
      )[1];

      act(() => {
        successCallback();
      });

      const valueContainer = screen
        .getByRole('textbox')
        .closest('.copyable-input__value-container');

      expect(valueContainer).toHaveClass('tooltipped');

      fireEvent.mouseLeave(valueContainer);

      expect(valueContainer).not.toHaveClass('tooltipped');
      expect(valueContainer).not.toHaveClass('tooltipped-n');
    });

    it('sets the aria-label on the value container', () => {
      render(<CopyableInput {...defaultProps} />);
      const valueContainer = screen
        .getByRole('textbox')
        .closest('.copyable-input__value-container');
      expect(valueContainer).toHaveAttribute(
        'aria-label',
        'CopyableInput.CopiedARIA'
      );
    });
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('renders the preview link with an aria-label when hasPreviewLink is true', () => {
      render(<CopyableInput {...defaultProps} hasPreviewLink />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'CopyableInput.CopiedARIA');
    });
  });

  // ─── Props ────────────────────────────────────────────────────────────────

  describe('prop handling', () => {
    it('updates the displayed value when the value prop changes', () => {
      const { rerender } = render(<CopyableInput {...defaultProps} />);
      rerender(<CopyableInput {...defaultProps} value="https://updated.com" />);
      expect(screen.getByRole('textbox')).toHaveValue('https://updated.com');
    });

    it('reflects a new label in the DOM when the label prop changes', () => {
      const { rerender } = render(<CopyableInput {...defaultProps} />);
      rerender(<CopyableInput {...defaultProps} label="New Label" />);
      expect(screen.getByText('New Label')).toBeInTheDocument();
    });
  });
});
