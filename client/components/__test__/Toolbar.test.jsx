import React from 'react';
import { shallow } from 'enzyme';
import { Toolbar } from '../../modules/IDE/components/Toolbar';


const initialProps = {
  isPlaying: false,
  preferencesIsVisible: false,
  stopSketch: jest.fn(),
  setProjectName: jest.fn(),
  openPreferences: jest.fn(),
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
  currentUser: 'me',
  originalProjectName: 'testname',

  owner: {
    username: 'me'
  },
  project: {
    name: 'testname',
    isEditingName: false,
    id: 'id',
  },
};


describe('<Toolbar />', () => {
  let component;
  let props = initialProps;
  let input;
  let renameTriggerButton;
  const changeName = (newFileName) => {
    component.find('.toolbar__project-name').simulate('click', { preventDefault: jest.fn() });
    input = component.find('.toolbar__project-name-input');
    renameTriggerButton = component.find('.toolbar__edit-name-button');
    renameTriggerButton.simulate('click');
    input.simulate('change', { target: { value: newFileName } });
    input.simulate('blur');
  };
  const setProps = (additionalProps) => {
    props = {
      ...props,
      ...additionalProps,

      project: {
        ...props.project,
        ...(additionalProps || {}).project
      },
    };
  };

  // Test Cases

  describe('with valid props', () => {
    beforeEach(() => {
      setProps();
      component = shallow(<Toolbar {...props} />);
    });
    it('renders', () => expect(component).toBeDefined());

    describe('when use owns sketch', () => {
      beforeEach(() => setProps({ currentUser: props.owner.username }));

      describe('when changing sketch name', () => {
        beforeEach(() => {
          setProps({
            project: { isEditingName: true, name: 'testname' },
            setProjectName: jest.fn(name => component.setProps({ project: { name } })),
          });
          component = shallow(<Toolbar {...props} />);
        });

        // it('should debug', () => console.log(component.debug()));

        describe('to a valid name', () => {
          beforeEach(() => changeName('hello'));
          it('should save', () => expect(props.setProjectName).toBeCalledWith('hello'));
        });


        describe('to an empty name', () => {
          beforeEach(() => changeName(''));
          it('should set name to empty', () => expect(props.setProjectName).toBeCalledWith(''));
          it(
            'should detect empty name and revert to original',
            () => expect(props.setProjectName).toHaveBeenLastCalledWith(initialProps.project.name)
          );
        });
      });
    });

    describe('when user does not own sketch', () => {
      beforeEach(() => setProps({ currentUser: 'not-the-owner' }));

      it('should disable edition', () => expect(component.find('.toolbar__edit-name-button')).toEqual({}));
    });
  });
});
