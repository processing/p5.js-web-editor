import { createPreviewFetch, getFileUrls, FileUrls } from './previewFetch';

const baseUrl = 'https://preview.p5js.org/kit/sketches/abc123/';
const s3 = 'https://assets.editor.p5js.org/pending/603164805e0b6d00201d63e1/';

function setup(fileUrls: FileUrls) {
  const originalFetch = jest.fn();
  const previewFetch = createPreviewFetch(originalFetch, fileUrls, baseUrl);
  return { originalFetch, previewFetch };
}

describe('getFileUrls', () => {
  test('maps every file path in the sketch to its link', () => {
    const files = [
      {
        _id: 'root',
        name: 'root',
        fileType: 'folder',
        children: ['sketch', 'models']
      },
      { _id: 'sketch', name: 'sketch.js', fileType: 'file', children: [] },
      {
        _id: 'models',
        name: 'models',
        fileType: 'folder',
        children: ['obj', 'mtl']
      },
      {
        _id: 'obj',
        name: 'ship.obj',
        fileType: 'file',
        children: [],
        url: `${s3}1f0c.obj`
      },
      {
        _id: 'mtl',
        name: 'ship.mtl',
        fileType: 'file',
        children: [],
        blobUrl: 'blob:https://preview.p5js.org/9d2e'
      }
    ];

    expect(getFileUrls(files)).toEqual({
      'models/ship.obj': `${s3}1f0c.obj`,
      'models/ship.mtl': 'blob:https://preview.p5js.org/9d2e'
    });
  });
});

describe('createPreviewFetch', () => {
  const fileUrls = {
    'showcase.obj': `${s3}43f149c2.obj`,
    'showcase.mtl': 'blob:https://preview.p5js.org/5b1d',
    'tiles.png': `${s3}8e7a.png?v=1730000000000`,
    'data/points.json': 'blob:https://preview.p5js.org/77c0'
  };

  test('leaves links outside the sketch alone', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);
    const url = 'https://cdn.jsdelivr.net/npm/p5@2.4.0/lib/p5.min.js';

    previewFetch(url);

    expect(originalFetch).toHaveBeenCalledWith(url, undefined);
  });

  test('sends a relative path to the file link', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);

    previewFetch('data/points.json');

    expect(originalFetch).toHaveBeenCalledWith(
      'blob:https://preview.p5js.org/77c0',
      {
        method: 'GET'
      }
    );
  });

  test('finds the .mtl and textures next to a model loaded from S3', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);
    const headers = { accept: 'image/*' };
    const { signal } = new AbortController();
    const textureRequest = ({
      url: `${s3}tiles.png`,
      method: 'GET',
      headers,
      signal,
      mode: 'cors',
      cache: 'no-store'
    } as unknown) as Request;

    previewFetch(fileUrls['showcase.obj']);
    previewFetch(`${s3}showcase.mtl`, { method: 'HEAD' });
    previewFetch(textureRequest);

    expect(originalFetch).toHaveBeenNthCalledWith(
      1,
      fileUrls['showcase.obj'],
      undefined
    );
    expect(originalFetch).toHaveBeenNthCalledWith(
      2,
      'blob:https://preview.p5js.org/5b1d',
      { method: 'GET' }
    );
    expect(originalFetch).toHaveBeenNthCalledWith(3, fileUrls['tiles.png'], {
      headers,
      signal,
      mode: 'cors',
      cache: 'no-store',
      method: 'GET'
    });
  });

  test('takes a URL object', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);

    previewFetch(new URL('data/points.json', baseUrl));

    expect(originalFetch).toHaveBeenCalledWith(
      'blob:https://preview.p5js.org/77c0',
      {
        method: 'GET'
      }
    );
  });

  test('uses GET for HEAD on a blob the editor already swapped in', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);

    previewFetch(fileUrls['showcase.mtl'], { method: 'HEAD' });

    expect(originalFetch).toHaveBeenCalledWith(fileUrls['showcase.mtl'], {
      method: 'GET'
    });
  });

  test('keeps HEAD for links that are not blobs', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);

    previewFetch(`${s3}tiles.png`, { method: 'HEAD' });

    expect(originalFetch).toHaveBeenCalledWith(fileUrls['tiles.png'], {
      method: 'HEAD'
    });
  });

  test('keeps the folder of a model that sits in a folder', () => {
    const { originalFetch, previewFetch } = setup({
      'models/ship.obj': `${s3}1f0c.obj`,
      'models/ship.mtl': 'blob:https://preview.p5js.org/9d2e',
      'models/textures/hull.png': `${s3}c41a.png`,
      'hull.png': `${s3}0b3f.png`
    });

    previewFetch(`${s3}1f0c.obj`);
    previewFetch(`${s3}ship.mtl`);
    previewFetch(`${s3}textures/hull.png`);

    expect(originalFetch).toHaveBeenNthCalledWith(
      2,
      'blob:https://preview.p5js.org/9d2e',
      { method: 'GET' }
    );
    expect(originalFetch).toHaveBeenNthCalledWith(3, `${s3}c41a.png`, {
      method: 'GET'
    });
  });

  test('follows ../ out of the model folder', () => {
    const { originalFetch, previewFetch } = setup({
      'models/ship.obj': `${s3}1f0c.obj`,
      'textures/hull.png': `${s3}c41a.png`
    });

    previewFetch(`${s3}1f0c.obj`);
    previewFetch(`${s3}../textures/hull.png`);

    expect(originalFetch).toHaveBeenLastCalledWith(`${s3}c41a.png`, {
      method: 'GET'
    });
  });

  test('reads folder names with # or %', () => {
    const { originalFetch, previewFetch } = setup({
      'v2#final/ship.obj': `${s3}1f0c.obj`,
      'v2#final/ship.mtl': 'blob:https://preview.p5js.org/v2',
      '50%/hull.obj': `${s3}c41a.obj`,
      '50%/hull.mtl': 'blob:https://preview.p5js.org/50',
      'ship.mtl': 'blob:https://preview.p5js.org/root'
    });

    previewFetch(`${s3}1f0c.obj`);
    previewFetch(`${s3}ship.mtl`);
    previewFetch(`${s3}c41a.obj`);
    previewFetch(`${s3}hull.mtl`);

    expect(originalFetch).toHaveBeenNthCalledWith(
      2,
      'blob:https://preview.p5js.org/v2',
      { method: 'GET' }
    );
    expect(originalFetch).toHaveBeenNthCalledWith(
      4,
      'blob:https://preview.p5js.org/50',
      { method: 'GET' }
    );
  });

  test('prefers the folder of the last model loaded', () => {
    const { originalFetch, previewFetch } = setup({
      'cat/model.obj': `${s3}aa01.obj`,
      'cat/model.mtl': 'blob:https://preview.p5js.org/cat',
      'dog/model.obj': `${s3}bb02.obj`,
      'dog/model.mtl': 'blob:https://preview.p5js.org/dog'
    });

    previewFetch(`${s3}bb02.obj`);
    previewFetch(`${s3}model.mtl`);

    expect(originalFetch).toHaveBeenLastCalledWith(
      'blob:https://preview.p5js.org/dog',
      {
        method: 'GET'
      }
    );
  });

  test('reads file names with spaces', () => {
    const { originalFetch, previewFetch } = setup({
      'my model.obj': `${s3}aa01.obj`,
      'my model.mtl': 'blob:https://preview.p5js.org/5b1d'
    });

    previewFetch(`${s3}aa01.obj`);
    previewFetch(`${s3}my%20model.mtl`);

    expect(originalFetch).toHaveBeenLastCalledWith(
      'blob:https://preview.p5js.org/5b1d',
      {
        method: 'GET'
      }
    );
  });

  test('leaves requests that are not GET or HEAD alone', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);
    const init = { method: 'POST', body: 'x' };

    previewFetch('data/points.json', init);

    expect(originalFetch).toHaveBeenCalledWith('data/points.json', init);
  });

  test('leaves links it cannot read alone', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);

    previewFetch('http://[');

    expect(originalFetch).toHaveBeenCalledWith('http://[', undefined);
  });

  test('hands odd input to fetch instead of throwing', () => {
    const { originalFetch, previewFetch } = setup(fileUrls);
    const odd = (null as unknown) as string;

    expect(() => previewFetch(odd)).not.toThrow();
    expect(originalFetch).toHaveBeenCalledWith(null, undefined);
  });
});
