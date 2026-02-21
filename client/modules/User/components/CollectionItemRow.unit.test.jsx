import React from 'react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { reduxRender, screen, fireEvent, act } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';
import CollectionItemRow from './CollectionItemRow';

jest.mock('../../../i18n');

const mockStore = configureStore([thunk]);
const store = mockStore(initialTestState);

let subjectProps = {
  collection: {
    id: 'collection-123',
    name: 'Test Collection'
  },
  item: {
    createdAt: '2026-01-15T10:30:00.000Z',
    isDeleted: false,
    project: {
      id: 'project-456',
      name: 'My Sketch',
      user: { username: 'testuser' },
      visibility: 'Public'
    }
  },
  isOwner: true
};

const subject = () => {
  reduxRender(
    <table>
      <tbody>
        <CollectionItemRow {...subjectProps} />
      </tbody>
    </table>,
    { store }
  );
};

describe('<CollectionItemRow />', () => {
  afterEach(() => {
    store.clearActions();
  });

  it('renders the sketch name as a link', () => {
    subject();
    const link = screen.getByRole('link', { name: 'My Sketch' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/testuser/sketches/project-456');
  });

  it('renders the owner username', () => {
    subject();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('shows the remove button when user is the owner', () => {
    subject();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  describe('when user is not the owner', () => {
    beforeAll(() => {
      subjectProps = { ...subjectProps, isOwner: false };
    });

    afterAll(() => {
      subjectProps = { ...subjectProps, isOwner: true };
    });

    it('does not show the remove button', () => {
      subject();
      expect(
        screen.queryByRole('button', { name: /remove/i })
      ).not.toBeInTheDocument();
    });
  });

  it('wraps the remove button with a tooltip', async () => {
    subject();

    const button = screen.getByRole('button', { name: /remove/i });
    await act(async () => {
      fireEvent.mouseEnter(button);
    });
    expect(button).toHaveClass('tooltipped');
  });

  describe('when the project is deleted', () => {
    beforeAll(() => {
      subjectProps = {
        ...subjectProps,
        item: {
          ...subjectProps.item,
          isDeleted: true,
          project: undefined
        }
      };
    });

    it('shows the deleted sketch label', () => {
      subject();
      expect(screen.getByText('Sketch deleted')).toBeInTheDocument();
    });
  });
});
