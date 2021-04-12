import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { act, render } from '@testing-library/react';
import { userResponse } from './redux_test_stores/test_server_responses';

jest.mock('./i18n');

const server = setupServer(
  rest.get('/session', (req, res, ctx) => {
    console.log('called');
    return res(ctx.json(userResponse));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Application root', () => {
  // eslint-disable-next-line global-require
  const subject = () => require('./index');

  it('should render without crashing', () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);
    act(() => {
      subject();
    });

    // expect(ReactDOM.render).toHaveBeenCalledWith(<App />, div);
  });
});
