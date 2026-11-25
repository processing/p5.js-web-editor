import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import router from '../embed.routes';

jest.mock('../../utils/editorUrl', () => ({
  getEditorUrl: jest.fn(() => 'https://editor.example')
}));

const handlerFor = (path: string) => {
  const layer = (router as any).stack.find(
    (l: any) => l.route && l.route.path === path
  );
  return layer.route.stack[0].handle;
};

describe('embed routes redirect to the editor from EDITOR_URL', () => {
  it.each([
    [
      '/:username/embed/:project_id',
      { username: 'alice', project_id: 'abc' },
      'https://editor.example/alice/full/abc'
    ],
    [
      '/:username/present/:project_id',
      { username: 'alice', project_id: 'abc' },
      'https://editor.example/alice/full/abc'
    ],
    [
      '/embed/:project_id',
      { project_id: 'abc' },
      'https://editor.example/full/abc'
    ]
  ])('%s', (path, params, expected) => {
    const req: any = new MockRequest();
    req.params = params;
    req.headers.host = 'evil.example';
    const res: any = new MockResponse();

    handlerFor(path)(req, res);

    expect(res.redirect).toHaveBeenCalledWith(301, expected);
  });
});
