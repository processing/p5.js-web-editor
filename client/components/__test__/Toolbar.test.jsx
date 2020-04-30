import React from 'react';
import { shallow } from 'enzyme';
import { Toolbar } from '../../modules/IDE/components/Toolbar';

describe('<Toolbar />', () => {
  let component;
  let props = {};
  let input;
  let renameTriggerButton;
  const changeName = (newFileName) => {
    renameTriggerButton.simulate('click');
    input.simulate('change', { target: { value: newFileName } });
    input.simulate('blur');
  };
  const getState = () => component.state();
  const getUpdatedName = () => getState().updatedName;
  const setProps = (additionalProps) => {
    props = {
      isPlaying: false,
      preferencesIsVisible: false,
      stopSketch: jest.fn(),
      setProjectName: jest.fn(),
      openPreferences: jest.fn(),
      owner: {
        username: ''
      },
      project: {
        name: '',
        isEditingName: false,
        id: '',
      },
      showEditProjectName: jest.fn(),
      hideEditProjectName: jest.fn(),
      infiniteLoop: false,
      autorefresh: false,
      setAutorefresh: jest.fn(),
      setTextOutput: jest.fn(),
      setGridOutput: jest.fn(),
      startSketch: jest.fn(),
      startAccessibleSketch: jest.fn(),
      saveProject: jest.fn(),
      currentUser: '',
      ...additionalProps
    };
  };


  describe('with valid props', () => {
    beforeEach(() => {
      setProps();
      component = shallow(<Toolbar {...props} />);
    });
    it('renders', () => expect(component).toBeDefined());
  });
});
