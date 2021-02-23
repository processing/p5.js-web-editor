import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen, waitFor } from '../../../../test-utils';
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

const renderComponent = (extraProps = {}, container) => {
  // if we want to overwrite any of these props, we can do it with extraProps
  // later keys overwrite earlier ones in the spread operator
  const props = {
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
    setSoundOutput: jest.fn(),
    ...extraProps
  };
  render(<Preferences {...props} />, container);

  return props;
};

// TODOS
// do I need to think about the component functions? like increaseFontSize?
// is that possible?
describe('<Preferences />', () => {
  let container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  describe('font tests', () => {
    it('font size increase button says increase', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
      const fontPlusButton = screen.getByTestId('font-plus-button');

      // make button says "Increase"
      expect(fontPlusButton.textContent.toLowerCase()).toBe('increase');
    });

    it('increase font size by 2 when clicking plus button', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
      const fontPlusButton = screen.getByTestId('font-plus-button');

      act(() => {
        fireEvent.click(fontPlusButton);
      });

      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(14);
    });

    it('font size decrease button says decrease', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
      const fontPlusButton = screen.getByTestId('font-minus-button');

      // make button says "decrease"
      expect(fontPlusButton.textContent.toLowerCase()).toBe('decrease');
    });

    it('decrease font size by 2 when clicking minus button', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
      const fontMinusButton = screen.getByTestId('font-minus-button');

      act(() => {
        fireEvent.click(fontMinusButton);
      });

      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(10);
    });

    it('font text field changes on manual text input', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
      const input = screen.getByTestId('font-size-text-field');

      act(() => {
        fireEvent.change(input, { target: { value: '24' } });
      });
      act(() => {
        fireEvent.submit(screen.getByTestId('font-size-form'));
      });

      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(24);
    });

    it('font size CAN NOT go over 36', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
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
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
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
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
      const input = screen.getByTestId('font-size-text-field');

      act(() => {
        fireEvent.change(input, { target: { value: 'hi' } });
      });

      expect(input.value).toBe('12');

      act(() => {
        fireEvent.submit(screen.getByTestId('font-size-form'));
      });

      expect(props.setFontSize).toHaveBeenCalledTimes(1);
      expect(props.setFontSize.mock.calls[0][0]).toBe(12);
    });

    // this case is a bit synthetic because we wouldn't be able to type
    // h and then i, but it tests the same idea
    it('font size input field does NOT take "-"', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({ fontSize: 12 }, container);
      });

      // get ahold of the radio buttons for toggling autosave
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

    // click om the one already selected, the false one
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

    // expect that the setAutosave function was called with the value true
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter.mock.calls[0][0]).toBe(setterExpectedArgument);
  };

  describe('testing theme switching', () => {
    it('switch to light', () => {
      let props;
      act(() => {
        props = renderComponent({ theme: 'dark' }, container);
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
    it('switch to dark', () => {
      let props;
      act(() => {
        props = renderComponent({ theme: 'light' }, container);
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
      let props;
      act(() => {
        props = renderComponent({ theme: 'light' }, container);
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

  describe('testing toggle UI elements on starting tab', () => {
    it('autosave toggle, starting at false', () => {
      let props;
      // render the component with autosave set to false as default
      act(() => {
        props = renderComponent({}, container);
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

    it('autosave toggle, starting at true', () => {
      let props;
      // render the component with autosave prop set to true
      act(() => {
        props = renderComponent({ autosave: true }, container);
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

    it('autocloseBracketsQuotes toggle, starting at false', () => {
      let props;
      // render the component with autocloseBracketsQuotes prop set to false
      act(() => {
        props = renderComponent({}, container);
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

    it('autocloseBracketsQuotes toggle, starting at true', () => {
      let props;
      // render the component with autocloseBracketsQuotes prop set to false
      act(() => {
        props = renderComponent({ autocloseBracketsQuotes: true }, container);
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

    it('linewrap toggle, starting at false', () => {
      let props;
      // render the component with linewrap prop set to false
      act(() => {
        props = renderComponent({ linewrap: false }, container);
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

    it('linewrap toggle, starting at true', () => {
      let props;
      // render the component with linewrap prop set to false
      act(() => {
        props = renderComponent({ linewrap: true }, container);
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

  describe('can toggle between general settings and accessibility tabs successfully', () => {
    it('can toggle sucessfully', () => {
      let props;
      // render the component with lineNumbers prop set to false
      act(() => {
        props = renderComponent({}, container);
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
    it('lineNumbers toggle, starting at false', () => {
      let props;
      // render the component with lineNumbers prop set to false
      act(() => {
        props = renderComponent({ lineNumbers: false }, container);
      });

      // switch tabs
      act(() => {
        fireEvent.click(screen.getByTestId('accessibility-tab'));
      });

      // get ahold of the radio buttons for toggling linenumber settings
      const lineNumbersRadioFalse = screen.getByTestId(
        'lineNumbers-false-radio'
      );
      const lineNumbersRadioTrue = screen.getByTestId('lineNumbers-true-radio');

      testToggle(
        lineNumbersRadioFalse,
        lineNumbersRadioTrue,
        props.setLineNumbers,
        true
      );
    });

    it('lineNumbers toggle, starting at true', () => {
      let props;
      // render the component with lineNumbers prop set to false
      act(() => {
        props = renderComponent({ lineNumbers: true }, container);
      });

      // switch tabs
      act(() => {
        fireEvent.click(screen.getByTestId('accessibility-tab'));
      });

      // get ahold of the radio buttons for toggling autocloseBracketsQuotes
      const lineNumbersRadioFalse = screen.getByTestId(
        'lineNumbers-false-radio'
      );
      const lineNumbersRadioTrue = screen.getByTestId('lineNumbers-true-radio');

      testToggle(
        lineNumbersRadioTrue,
        lineNumbersRadioFalse,
        props.setLineNumbers,
        false
      );
    });

    it('lintWarning toggle, starting at false', () => {
      let props;
      // render the component with lintWarning prop set to false
      act(() => {
        props = renderComponent({ lintWarning: false }, container);
      });

      // switch tabs
      act(() => {
        fireEvent.click(screen.getByTestId('accessibility-tab'));
      });

      // get ahold of the radio buttons for toggling autocloseBracketsQuotes
      const lintWarningRadioFalse = screen.getByTestId(
        'lintWarning-false-radio'
      );
      const lintWarningRadioTrue = screen.getByTestId('lintWarning-true-radio');

      testToggle(
        lintWarningRadioFalse,
        lintWarningRadioTrue,
        props.setLintWarning,
        true
      );
    });

    it('lintWarning toggle, starting at true', () => {
      let props;
      // render the component with lintWarning prop set to false
      act(() => {
        props = renderComponent({ lintWarning: true }, container);
      });

      // switch tabs
      act(() => {
        fireEvent.click(screen.getByTestId('accessibility-tab'));
      });

      // get ahod of lthe radio buttons for toggling autocloseBracketsQuotes
      const lintWarningRadioFalse = screen.getByTestId(
        'lintWarning-false-radio'
      );
      const lintWarningRadioTrue = screen.getByTestId('lintWarning-true-radio');

      testToggle(
        lintWarningRadioTrue,
        lintWarningRadioFalse,
        props.setLintWarning,
        false
      );
    });

    const testCheckbox = (testid, startState, setter) => {
      let props;
      act(() => {
        props = renderComponent(
          {
            textOutput: startState && testid === 'text-output-checkbox',
            soundOutput: startState && testid === 'sound-output-checkbox',
            gridOutput: startState && testid === 'grid-output-checkbox'
          },
          container
        );
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

    it('multiple checkboxes can be selected', () => {
      let props;
      act(() => {
        props = renderComponent(
          { textOutput: true, soundOutput: true, gridOutput: true },
          container
        );
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

    it('none of the checkboxes can be selected', () => {
      let props;
      act(() => {
        props = renderComponent(
          { textOutput: false, soundOutput: false, gridOutput: false },
          container
        );
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
