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

  it('autosave toggle, starting at false', () => {
    let props;
    // render the component with autosave set to false as default
    act(() => {
      props = renderComponent({}, container);
    });

    // get ahold of the radio buttons for toggling autosave
    const autosaveRadioFalse = screen.getByTestId('autosave-false-radio');
    const autosaveRadioTrue = screen.getByTestId('autosave-true-radio');

    // make sure one is false and the other is true
    expect(autosaveRadioFalse.checked).toBe(true);
    expect(autosaveRadioTrue.checked).toBe(false);

    // click om the one already selected, the false one
    act(() => {
      fireEvent.click(autosaveRadioFalse);
    });

    // the value has not changed so OnChange has not been called
    expect(props.setAutosave).toHaveBeenCalledTimes(0);
    // this radio buttons should still be the same
    expect(autosaveRadioFalse.checked).toBe(true);
    expect(autosaveRadioTrue.checked).toBe(false);

    // now we click the other one that's not yet selected
    act(() => {
      fireEvent.click(autosaveRadioTrue);
    });

    // expect that the setAutosave function was called with the value true
    expect(props.setAutosave).toHaveBeenCalledTimes(1);
    expect(props.setAutosave.mock.calls[0][0]).toBe(true);
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

    // make sure one is false and the other is true
    expect(autosaveRadioFalse.checked).toBe(false);
    expect(autosaveRadioTrue.checked).toBe(true);

    // click om the one already selected, the false one
    act(() => {
      fireEvent.click(autosaveRadioTrue);
    });

    // the value has not changed so OnChange has not been called
    expect(props.setAutosave).toHaveBeenCalledTimes(0);
    // this radio buttons should still be the same
    expect(autosaveRadioFalse.checked).toBe(false);
    expect(autosaveRadioTrue.checked).toBe(true);

    // now we click the other one that's not yet selected
    act(() => {
      fireEvent.click(autosaveRadioFalse);
    });

    // expect that the setAutosave function was called with the value false
    expect(props.setAutosave).toHaveBeenCalledTimes(1);
    expect(props.setAutosave.mock.calls[0][0]).toBe(false);
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

    // make sure one is false and the other is true
    expect(autocloseRadioFalse.checked).toBe(true);
    expect(autocloseRadioTrue.checked).toBe(false);

    // click on the one already selected, the false one
    act(() => {
      fireEvent.click(autocloseRadioFalse);
    });

    // the value has not changed so OnChange has not been called
    expect(props.setAutocloseBracketsQuotes).toHaveBeenCalledTimes(0);
    // this radio buttons should still be the same
    expect(autocloseRadioFalse.checked).toBe(true);
    expect(autocloseRadioTrue.checked).toBe(false);

    // now we click the other one that's not yet selected
    act(() => {
      fireEvent.click(autocloseRadioTrue);
    });

    // expect that the setautoclose function was called with the value false
    expect(props.setAutocloseBracketsQuotes).toHaveBeenCalledTimes(1);
    expect(props.setAutocloseBracketsQuotes.mock.calls[0][0]).toBe(true);
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

    // make sure one is false and the other is true
    expect(autocloseRadioFalse.checked).toBe(false);
    expect(autocloseRadioTrue.checked).toBe(true);

    // click on the one already selected, the false one
    act(() => {
      fireEvent.click(autocloseRadioTrue);
    });

    // the value has not changed so OnChange has not been called
    expect(props.setAutocloseBracketsQuotes).toHaveBeenCalledTimes(0);
    // this radio buttons should still be the same
    expect(autocloseRadioFalse.checked).toBe(false);
    expect(autocloseRadioTrue.checked).toBe(true);

    // now we click the other one that's not yet selected
    act(() => {
      fireEvent.click(autocloseRadioFalse);
    });

    // expect that the setautoclose function was called with the value false
    expect(props.setAutocloseBracketsQuotes).toHaveBeenCalledTimes(1);
    expect(props.setAutocloseBracketsQuotes.mock.calls[0][0]).toBe(false);
  });
});
