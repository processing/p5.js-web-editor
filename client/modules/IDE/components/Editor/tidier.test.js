import prettier from 'prettier/standalone';
import tidyCodeWithPrettier from './tidier';

jest.mock('prettier/standalone');

describe('tidyCodeWithPrettier', () => {
  let mockDispatch;
  let mockFocus;
  let mockView;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockFocus = jest.fn();

    mockView = {
      state: {
        doc: {
          toString: () => 'function  test(){return 1}',
          length: 30
        },
        selection: {
          main: { head: 10 }
        }
      },
      dispatch: mockDispatch,
      focus: mockFocus
    };

    prettier.formatWithCursor.mockClear();
  });

  it('formats JavaScript and updates document + cursor', () => {
    prettier.formatWithCursor.mockReturnValue({
      formatted: 'function test() {\n  return 1;\n}',
      cursorOffset: 12
    });

    tidyCodeWithPrettier(mockView, 'javascript');

    expect(prettier.formatWithCursor).toHaveBeenCalledWith(
      'function  test(){return 1}',
      expect.objectContaining({
        parser: 'babel'
      })
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      changes: {
        from: 0,
        to: 30,
        insert: 'function test() {\n  return 1;\n}'
      },
      selection: { anchor: 12 }
    });

    expect(mockFocus).toHaveBeenCalled();
  });

  it('formats CSS using css parser', () => {
    prettier.formatWithCursor.mockReturnValue({
      formatted: 'body { color: red; }',
      cursorOffset: 5
    });

    tidyCodeWithPrettier(mockView, 'css');

    expect(prettier.formatWithCursor).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        parser: 'css'
      })
    );

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('formats HTML using html parser', () => {
    prettier.formatWithCursor.mockReturnValue({
      formatted: '<div></div>',
      cursorOffset: 3
    });

    tidyCodeWithPrettier(mockView, 'html');

    expect(prettier.formatWithCursor).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        parser: 'html'
      })
    );

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('does nothing for unsupported mode', () => {
    tidyCodeWithPrettier(mockView, 'python');

    expect(prettier.formatWithCursor).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
