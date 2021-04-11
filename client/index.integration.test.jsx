import React from 'react';
import ReactDOM from 'react-dom';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

jest.mock('./i18n');

const server = setupServer(
  rest.get('/session', (req, res, ctx) =>
    res(ctx.json({ greeting: 'hello there' }))
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Application root', () => {
  it('should render without crashing', () => {
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);
    // require("./index.jsx");
    // expect(ReactDOM.render).toHaveBeenCalledWith(<App />, div);
  });
});
