import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { act } from 'react-dom/test-utils';
import SketchList from './SketchList';
import { reduxRender, fireEvent, screen, within } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';

jest.mock('../../../i18n');

const server = setupServer(
  rest.get(`/${initialTestState.user.username}/projects`, (req, res, ctx) =>
    // it just needs to return something so it doesn't throw an error
    // Sketchlist tries to grab projects on creation but for the unit test
    // we just feed those in as part of the initial state
    res(ctx.json({ data: 'foo' }))
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('<Sketchlist />', () => {
  const mockStore = configureStore([thunk]);
  const store = mockStore(initialTestState);

  let subjectProps = { username: initialTestState.user.username };

  const subject = () =>
    reduxRender(<SketchList {...subjectProps} />, { store });

  afterEach(() => {
    store.clearActions();
  });

  it('has sample projects', () => {
    act(() => {
      subject();
    });
    expect(screen.getByText('testsketch1')).toBeInTheDocument();
    expect(screen.getByText('testsketch2')).toBeInTheDocument();
  });

  it('clicking on date created row header dispatches a reordering action', () => {
    act(() => {
      subject();
    });

    act(() => {
      fireEvent.click(screen.getByText(/date created/i));
    });

    const expectedAction = [{ type: 'TOGGLE_DIRECTION', field: 'createdAt' }];
    expect(store.getActions()).toEqual(expect.arrayContaining(expectedAction));
  });

  it('clicking on dropdown arrow opens sketch options - sketches belong to user', () => {
    act(() => {
      subject();
    });

    const row = screen.getByRole('row', {
      name: /testsketch1/
    });

    const dropdown = within(row).getByRole('button', {
      name: 'Toggle Open/Close Sketch Options'
    });

    act(() => {
      fireEvent.click(dropdown);
    });

    expect(screen.queryByText('Rename')).toBeInTheDocument();
    expect(screen.queryByText('Duplicate')).toBeInTheDocument();
    expect(screen.queryByText('Download')).toBeInTheDocument();
    expect(screen.queryByText('Add to collection')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).toBeInTheDocument();
  });

  it('snapshot testing', () => {
    const { asFragment } = subject();
    expect(asFragment()).toMatchSnapshot();
  });

  describe('different user than the one who created the sketches', () => {
    beforeAll(() => {
      subjectProps = { username: 'notthesameusername' };
    });

    it('clicking on dropdown arrow opens sketch options without Rename or Delete option', () => {
      act(() => {
        subject();
      });

      const row = screen.getByRole('row', {
        name: /testsketch1/
      });

      const dropdown = within(row).getByRole('button', {
        name: 'Toggle Open/Close Sketch Options'
      });

      act(() => {
        fireEvent.click(dropdown);
      });

      expect(screen.queryByText('Rename')).not.toBeInTheDocument();
      expect(screen.queryByText('Duplicate')).toBeInTheDocument();
      expect(screen.queryByText('Download')).toBeInTheDocument();
      expect(screen.queryByText('Add to collection')).toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });
});
