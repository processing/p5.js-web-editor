import React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen } from '../../../../test-utils';
import Preferences from './index';

/* props to pass in:
 * - this.props.fontSize : number
 * - this.props.autosave : bool
 * - this.props.autocloseBracketsQuotes : bool
 * - this.props.linewrap : bool
 * - this.props.lineNumbers : bool
 * - this.props.theme : string
 * - this.props.lintWarning : bool
 * - this.props.textOutput : bool
 * - this.props.gridOutput : bool
 * - this.props.soundOutput : bool
 * - t from internationalization
 *
 * - this.props.setFontSize(fontsize : number)
 * - this.props.setAutosave(value : bool)
 * - this.props.setAutocloseBracketsQuotes(value: bool)
 * - this.props.setLinewrap(value : bool)
 * - this.props.setLineNumbers(value : bool)
 * - this.props.setTheme(color : string) -> can be {"light", "dark", "contrast"}
 * - this.props.setLintWarning(value : bool)
 * - this.props.setTextOutput(value : bool)
 * - this.props.setGridOutput(value : bool)
 * - this.props.setSoundOutput(value : bool)
 * -
 */

describe('<Preferences />', () => {
  let props = {
    t: jest.fn(),
    fontSize: 12,
    autosave: false,
    autocloseBracketsQuotes: false,
    linewrap: false,
    lineNumbers: false,
    theme: 'contrast',
    lintWarning: false,
    textOutput: false,
    gridOutput: false,
    soundOutput: false,
    setFontSize: jest.fn(),
    setAutosave: jest.fn(),
    setAutocloseBracketsQuotes: jest.fn(),
    setLinewrap: jest.fn(),
    setLineNumbers: jest.fn(),
    setTheme: jest.fn(),
    setLintWarning: jest.fn(),
    setTextOutput: jest.fn(),
    setGridOutput: jest.fn(),
    setSoundOutput: jest.fn()
  };

  const subject = () => render(<Preferences {...props} />);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('font tests', () => {
    it('font size increase button says increase', () => {
      // render the component
      act(() => {
        subject();
      });

      // get ahold of the button for increasing text size
      const fontPlusButton = screen.getByTestId('font-plus-button');

      // check that button says says "Increase"
      expect(fontPlusButton.textContent.toLowerCase()).toBe('increase');
    });

    it('increase font size by 2 when clicking plus button', () => {
      // render the component with font size set to 12
      act(() => {
        subject();
      });

      // get ahold of the button for increasing text size
      const fontPlusButton = screen.getByTestId('font-plus-button');

      // click the button
      act(() => {
        fireEvent.click(fontPlusButton);
      });

      // expect that setFontSize has been called once with the argument 14
      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(14);
    });

    it('font size decrease button says decrease', () => {
      // render the component with font size set to 12
      act(() => {
        subject();
      });

      // get ahold of the button for decreasing font size
      const fontPlusButton = screen.getByTestId('font-minus-button');

      // check that button says "decrease"
      expect(fontPlusButton.textContent.toLowerCase()).toBe('decrease');
    });

    it('decrease font size by 2 when clicking minus button', () => {
      // render the component with font size set to 12
      act(() => {
        subject();
      });

      // get ahold of the button for decreasing text size
      const fontMinusButton = screen.getByTestId('font-minus-button');

      // click it
      act(() => {
        fireEvent.click(fontMinusButton);
      });

      // expect that setFontSize would have been called once with argument 10
      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(10);
    });

    it('font text field changes on manual text input', () => {
      // render the component with font size set to 12
      act(() => {
        subject();
      });

      // get ahold of the text field
      const input = screen.getByTestId('font-size-text-field');

      // change input to 24
      act(() => {
        fireEvent.change(input, { target: { value: '24' } });
      });

      // submit form
      act(() => {
        fireEvent.submit(screen.getByTestId('font-size-form'));
      });

      // expect that setFontSize was called once with 24
      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(24);
    });

    it('font size CAN NOT go over 36', () => {
      // render the component
      act(() => {
        subject();
      });

      // get ahold of the text field
      const input = screen.getByTestId('font-size-text-field');

      act(() => {
        fireEvent.change(input, { target: { value: '100' } });
      });

      expect(input.value).toBe('100');

      act(() => {
        fireEvent.submit(screen.getByTestId('font-size-form'));
      });

      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(36);
    });

    it('font size CAN NOT go under 8', () => {
      // render the component
      act(() => {
        subject();
      });

      // get ahold of the text field
      const input = screen.getByTestId('font-size-text-field');

      act(() => {
        fireEvent.change(input, { target: { value: '0' } });
      });

      expect(input.value).toBe('0');

      act(() => {
        fireEvent.submit(screen.getByTestId('font-size-form'));
      });

      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(8);
    });

    // this case is a bit synthetic because we wouldn't be able to type
    // h and then i, but it tests the same idea
    it('font size input field does NOT take non-integers', () => {
      // render the component
      act(() => {
        subject();
      });

      // get ahold of the text field
      const input = screen.getByTestId('font-size-text-field');

      act(() => {
        fireEvent.change(input, { target: { value: 'hi' } });
      });

      // it shouldnt have changed at all
      expect(input.value).toBe('12');

      // we hit submit
      act(() => {
        fireEvent.submit(screen.getByTestId('font-size-form'));
      });

      // it still sets the font size but it's still 12
      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(12);
    });

    it('font size input field does NOT take "-"', () => {
      // render the component
      act(() => {
        subject();
      });

      // get ahold of the text field
      const input = screen.getByTestId('font-size-text-field');

      act(() => {
        fireEvent.change(input, { target: { value: '-' } });
      });

      expect(input.value).toBe('12');

      act(() => {
        fireEvent.submit(screen.getByTestId('font-size-form'));
      });

      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(12);
    });
  });

  const testToggle = (
    checkedRadio,
    uncheckedRadio,
    setter,
    setterExpectedArgument
  ) => {
    // make sure one is false and the other is true
    expect(checkedRadio.checked).toBe(true);
    expect(uncheckedRadio.checked).toBe(false);

    // click on the one already selected
    act(() => {
      fireEvent.click(checkedRadio);
    });

    // the value has not changed so OnChange has not been called
    expect(setter).toHaveBeenCalledTimes(0);
    // this radio buttons should still be the same
    expect(checkedRadio.checked).toBe(true);
    expect(uncheckedRadio.checked).toBe(false);

    // now we click the other one that's not yet selected
    act(() => {
      fireEvent.click(uncheckedRadio);
    });

    // expect that the setter function was called with the value true
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter.mock.calls[0][0]).toBe(setterExpectedArgument);
  };

  describe('testing theme switching', () => {
    describe('dark mode', () => {
      beforeAll(() => {
        props.theme = 'dark';
      });

      it('switch to light', () => {
        act(() => {
          subject();
        });

        const themeRadioCurrent = screen.getByTestId('theme-dark-radio');
        expect(themeRadioCurrent.checked).toBe(true);

        const themeRadioAfter = screen.getByTestId('theme-light-radio');
        act(() => {
          fireEvent.click(themeRadioAfter);
        });

        expect(props.setTheme).toHaveBeenCalledTimes(1);
        expect(props.setTheme.mock.calls[0][0]).toBe('light');
      });
    });

    describe('light mode', () => {
      beforeAll(() => {
        props.theme = 'light';
      });

      it('switch to dark', () => {
        act(() => {
          subject();
        });

        const themeRadioCurrent = screen.getByTestId('theme-light-radio');
        expect(themeRadioCurrent.checked).toBe(true);

        const themeRadioAfter = screen.getByTestId('theme-dark-radio');
        act(() => {
          fireEvent.click(themeRadioAfter);
        });

        expect(props.setTheme).toHaveBeenCalledTimes(1);
        expect(props.setTheme.mock.calls[0][0]).toBe('dark');
      });

      it('switch to contrast', () => {
        act(() => {
          subject();
        });
        const themeRadioCurrent = screen.getByTestId('theme-light-radio');
        expect(themeRadioCurrent.checked).toBe(true);

        const themeRadioAfter = screen.getByTestId('theme-contrast-radio');
        act(() => {
          fireEvent.click(themeRadioAfter);
        });

        expect(props.setTheme).toHaveBeenCalledTimes(1);
        expect(props.setTheme.mock.calls[0][0]).toBe('contrast');
      });
    });
  });

  describe('testing toggle UI elements on starting tab', () => {
    it('autosave toggle, starting at false', () => {
      act(() => {
        subject();
      });

      // get ahold of the radio buttons for toggling autosave
      const autosaveRadioFalse = screen.getByTestId('autosave-false-radio');
      const autosaveRadioTrue = screen.getByTestId('autosave-true-radio');

      testToggle(
        autosaveRadioFalse,
        autosaveRadioTrue,
        props.setAutosave,
        true
      );
    });

    it('autocloseBracketsQuotes toggle, starting at false', () => {
      // render the component with autocloseBracketsQuotes prop set to false
      act(() => {
        subject();
      });

      // get ahold of the radio buttons for toggling autocloseBracketsQuotes
      const autocloseRadioFalse = screen.getByTestId('autoclose-false-radio');
      const autocloseRadioTrue = screen.getByTestId('autoclose-true-radio');

      testToggle(
        autocloseRadioFalse,
        autocloseRadioTrue,
        props.setAutocloseBracketsQuotes,
        true
      );
    });

    describe('start autosave value at true', () => {
      beforeAll(() => {
        props.autosave = true;
      });

      it('autosave toggle, starting at true', () => {
        // render the component with autosave prop set to true
        act(() => {
          subject();
        });

        // get ahold of the radio buttons for toggling autosave
        const autosaveRadioFalse = screen.getByTestId('autosave-false-radio');
        const autosaveRadioTrue = screen.getByTestId('autosave-true-radio');

        testToggle(
          autosaveRadioTrue,
          autosaveRadioFalse,
          props.setAutosave,
          false
        );
      });
    });

    describe('start autoclose brackets value at true', () => {
      beforeAll(() => {
        props.autocloseBracketsQuotes = true;
      });

      it('autocloseBracketsQuotes toggle, starting at true', () => {
        act(() => {
          subject();
        });

        // get ahold of the radio buttons for toggling autocloseBracketsQuotes
        const autocloseRadioFalse = screen.getByTestId('autoclose-false-radio');
        const autocloseRadioTrue = screen.getByTestId('autoclose-true-radio');

        testToggle(
          autocloseRadioTrue,
          autocloseRadioFalse,
          props.setAutocloseBracketsQuotes,
          false
        );
      });
    });

    describe('start linewrap at false', () => {
      beforeAll(() => {
        props.linewrap = false;
      });

      it('linewrap toggle, starting at false', () => {
        // render the component with linewrap prop set to false
        act(() => {
          subject();
        });

        // get ahold of the radio buttons for toggling autocloseBracketsQuotes
        const linewrapRadioFalse = screen.getByTestId('linewrap-false-radio');
        const linewrapRadioTrue = screen.getByTestId('linewrap-true-radio');

        testToggle(
          linewrapRadioFalse,
          linewrapRadioTrue,
          props.setLinewrap,
          true
        );
      });
    });

    describe('start linewrap at true', () => {
      beforeAll(() => {
        props.linewrap = true;
      });

      it('linewrap toggle, starting at true', () => {
        // render the component with linewrap prop set to false
        act(() => {
          subject();
        });

        // get ahold of the radio buttons for toggling autocloseBracketsQuotes
        const linewrapRadioFalse = screen.getByTestId('linewrap-false-radio');
        const linewrapRadioTrue = screen.getByTestId('linewrap-true-radio');

        testToggle(
          linewrapRadioTrue,
          linewrapRadioFalse,
          props.setLinewrap,
          false
        );
      });
    });
  });

  describe('can toggle between general settings and accessibility tabs successfully', () => {
    it('can toggle sucessfully', () => {
      // render the component with lineNumbers prop set to false
      act(() => {
        subject();
      });

      // switch to accessibility
      act(() => {
        fireEvent.click(screen.getByTestId('accessibility-tab'));
      });

      const accessibilityElement1 = screen.getByTestId(
        'lineNumbers-false-radio'
      );
      expect(accessibilityElement1).toBeTruthy();

      // switch back
      act(() => {
        fireEvent.click(screen.getByTestId('general-settings-tab'));
      });

      const accessibilityElement2 = screen.getByTestId('linewrap-false-radio');
      expect(accessibilityElement2).toBeTruthy();
    });
  });

  describe('testing toggle UI elements on accessibility tab', () => {
    describe('starting linenumbers at false', () => {
      beforeAll(() => {
        props.lineNumbers = false;
      });

      it('lineNumbers toggle, starting at false', () => {
        // render the component with lineNumbers prop set to false
        act(() => {
          subject();
        });

        // switch tabs
        act(() => {
          fireEvent.click(screen.getByTestId('accessibility-tab'));
        });

        // get ahold of the radio buttons for toggling linenumber settings
        const lineNumbersRadioFalse = screen.getByTestId(
          'lineNumbers-false-radio'
        );
        const lineNumbersRadioTrue = screen.getByTestId(
          'lineNumbers-true-radio'
        );

        testToggle(
          lineNumbersRadioFalse,
          lineNumbersRadioTrue,
          props.setLineNumbers,
          true
        );
      });
    });

    describe('starting linenumbers at true', () => {
      beforeAll(() => {
        props.lineNumbers = true;
      });

      it('lineNumbers toggle, starting at true', () => {
        // render the component with lineNumbers prop set to false
        act(() => {
          subject();
        });

        // switch tabs
        act(() => {
          fireEvent.click(screen.getByTestId('accessibility-tab'));
        });

        // get ahold of the radio buttons for toggling autocloseBracketsQuotes
        const lineNumbersRadioFalse = screen.getByTestId(
          'lineNumbers-false-radio'
        );
        const lineNumbersRadioTrue = screen.getByTestId(
          'lineNumbers-true-radio'
        );

        testToggle(
          lineNumbersRadioTrue,
          lineNumbersRadioFalse,
          props.setLineNumbers,
          false
        );
      });
    });

    describe('starting lintWarning at false', () => {
      beforeAll(() => {
        props.lintWarning = false;
      });

      it('lintWarning toggle, starting at false', () => {
        // render the component with lintWarning prop set to false
        act(() => {
          subject();
        });

        // switch tabs
        act(() => {
          fireEvent.click(screen.getByTestId('accessibility-tab'));
        });

        // get ahold of the radio buttons for toggling autocloseBracketsQuotes
        const lintWarningRadioFalse = screen.getByTestId(
          'lintWarning-false-radio'
        );
        const lintWarningRadioTrue = screen.getByTestId(
          'lintWarning-true-radio'
        );

        testToggle(
          lintWarningRadioFalse,
          lintWarningRadioTrue,
          props.setLintWarning,
          true
        );
      });
    });

    describe('starting lintWarning at true', () => {
      beforeAll(() => {
        props.lintWarning = true;
      });

      it('lintWarning toggle, starting at true', () => {
        // render the component with lintWarning prop set to false
        act(() => {
          subject();
        });

        // switch tabs
        act(() => {
          fireEvent.click(screen.getByTestId('accessibility-tab'));
        });

        // get ahod of lthe radio buttons for toggling autocloseBracketsQuotes
        const lintWarningRadioFalse = screen.getByTestId(
          'lintWarning-false-radio'
        );
        const lintWarningRadioTrue = screen.getByTestId(
          'lintWarning-true-radio'
        );

        testToggle(
          lintWarningRadioTrue,
          lintWarningRadioFalse,
          props.setLintWarning,
          false
        );
      });
    });

    const testCheckbox = (testid, startState, setter) => {
      props = {
        ...props,
        textOutput: startState && testid === 'text-output-checkbox',
        soundOutput: startState && testid === 'sound-output-checkbox',
        gridOutput: startState && testid === 'grid-output-checkbox'
      };

      act(() => {
        subject();
      });

      // switch tabs
      act(() => {
        fireEvent.click(screen.getByTestId('accessibility-tab'));
      });

      const testedCheckbox = screen.getByTestId(testid);

      if (startState) {
        expect(testedCheckbox.checked).toBe(true);
      } else {
        expect(testedCheckbox.checked).toBe(false);
      }

      act(() => {
        fireEvent.click(testedCheckbox);
      });

      expect(props[setter]).toHaveBeenCalledTimes(1);
      expect(props[setter].mock.calls[0][0]).toBe(!startState);
    };

    it('clicking on text output checkbox to unselect it', () => {
      testCheckbox('text-output-checkbox', true, 'setTextOutput');
    });

    it('clicking on text output checkbox to select it', () => {
      testCheckbox('text-output-checkbox', false, 'setTextOutput');
    });

    it('clicking on sound output checkbox to unselect it', () => {
      testCheckbox('sound-output-checkbox', true, 'setSoundOutput');
    });

    it('clicking on sound output checkbox to select it', () => {
      testCheckbox('sound-output-checkbox', false, 'setSoundOutput');
    });

    it('clicking on grid output checkbox to unselect it', () => {
      testCheckbox('grid-output-checkbox', true, 'setGridOutput');
    });

    it('clicking on grid output checkbox to select it', () => {
      testCheckbox('grid-output-checkbox', false, 'setGridOutput');
    });

    describe('multiple checkboxes can be selected', () => {
      beforeAll(() => {
        props = {
          ...props,
          textOutput: true,
          soundOutput: true,
          gridOutput: true
        };
      });

      it('multiple checkboxes can be selected', () => {
        act(() => {
          subject();
        });

        // switch tabs
        act(() => {
          fireEvent.click(screen.getByTestId('accessibility-tab'));
        });

        const textOutputCheckbox = screen.getByTestId('text-output-checkbox');
        const soundOutputCheckbox = screen.getByTestId('sound-output-checkbox');
        const gridOutputCheckbox = screen.getByTestId('grid-output-checkbox');

        expect(textOutputCheckbox.checked).toBe(true);
        expect(soundOutputCheckbox.checked).toBe(true);
        expect(gridOutputCheckbox.checked).toBe(true);
      });
    });

    describe('none of the checkboxes can be selected', () => {
      beforeAll(() => {
        props = {
          ...props,
          textOutput: false,
          soundOutput: false,
          gridOutput: false
        };
      });
      it('none of the checkboxes can be selected', () => {
        act(() => {
          subject();
        });

        // switch tabs
        act(() => {
          fireEvent.click(screen.getByTestId('accessibility-tab'));
        });

        const textOutputCheckbox = screen.getByTestId('text-output-checkbox');
        const soundOutputCheckbox = screen.getByTestId('sound-output-checkbox');
        const gridOutputCheckbox = screen.getByTestId('grid-output-checkbox');

        expect(textOutputCheckbox.checked).toBe(false);
        expect(soundOutputCheckbox.checked).toBe(false);
        expect(gridOutputCheckbox.checked).toBe(false);
      });
    });
  });
});
