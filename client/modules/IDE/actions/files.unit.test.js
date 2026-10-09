import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { setUnsavedChanges, setSelectedFile, createError } from './ide';
import { setProjectSavedTime } from './project';
import {
  handleDuplicateFile,
  generateDuplicateFileName,
  createFile
} from './files';

const mockStore = configureStore([thunk]);

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('generateDuplicateFileName', () => {
  it('generates the first duplicate name for a file', () => {
    const files = [
      {
        id: 'root',
        children: ['sketch']
      },
      {
        id: 'sketch',
        name: 'sketch.js'
      }
    ];

    const result = generateDuplicateFileName('sketch.js', 'root', files);

    expect(result).toBe('sketch-(1).js');
  });

  it('increments the suffix when the first duplicate already exists', () => {
    const files = [
      {
        id: 'root',
        children: ['sketch', 'duplicate']
      },
      {
        id: 'sketch',
        name: 'sketch.js'
      },
      {
        id: 'duplicate',
        name: 'sketch-(1).js'
      }
    ];

    const result = generateDuplicateFileName('sketch.js', 'root', files);

    expect(result).toBe('sketch-(2).js');
  });

  it('uses the lowest available suffix when duplicating an already suffixed file', () => {
    const files = [
      {
        id: 'root',
        children: ['sketch', 'duplicate1', 'duplicate3']
      },
      {
        id: 'sketch',
        name: 'sketch-(2).js'
      },
      {
        id: 'duplicate1',
        name: 'sketch-(3).js'
      },
      {
        id: 'duplicate3',
        name: 'sketch-(4).js'
      }
    ];

    const result = generateDuplicateFileName('sketch-(2).js', 'root', files);

    expect(result).toBe('sketch-(1).js');
  });

  it('preserves multiple dots in the filename', () => {
    const files = [
      {
        id: 'root',
        children: ['file']
      },
      {
        id: 'file',
        name: 'app.test.js'
      }
    ];

    const result = generateDuplicateFileName('app.test.js', 'root', files);

    expect(result).toBe('app.test-(1).js');
  });

  it('handles files without an extension', () => {
    const files = [
      {
        id: 'root',
        children: ['readme']
      },
      {
        id: 'readme',
        name: 'README'
      }
    ];

    const result = generateDuplicateFileName('README', 'root', files);

    expect(result).toBe('README-(1)');
  });

  it('uses the lowest available suffix when there is a gap', () => {
    const files = [
      {
        id: 'root',
        children: ['original', 'duplicate1', 'duplicate3']
      },
      {
        id: 'original',
        name: 'sketch.js'
      },
      {
        id: 'duplicate1',
        name: 'sketch-(1).js'
      },
      {
        id: 'duplicate3',
        name: 'sketch-(3).js'
      }
    ];

    const result = generateDuplicateFileName('sketch.js', 'root', files);

    expect(result).toBe('sketch-(2).js');
  });

  it('ignores files with the same name in a different folder', () => {
    const files = [
      {
        id: 'root',
        children: ['folder1', 'folder2']
      },
      {
        id: 'folder1',
        name: 'folder1',
        fileType: 'folder',
        children: ['sketch1']
      },
      {
        id: 'folder2',
        name: 'folder2',
        fileType: 'folder',
        children: ['sketch2']
      },
      {
        id: 'sketch1',
        name: 'sketch.js',
        parentId: 'folder1'
      },
      {
        id: 'sketch2',
        name: 'sketch-(1).js',
        parentId: 'folder2'
      }
    ];

    const result = generateDuplicateFileName('sketch.js', 'folder1', files);

    expect(result).toBe('sketch-(1).js');
  });
});

describe('handleDuplicateFile', () => {
  const projectId = 'project-1';
  const parentId = 'folder-1';

  const sourceFile = {
    id: 'file-1',
    name: 'sketch.js',
    fileType: 'file',
    content: 'console.log("hello");',
    children: []
  };

  const parentFolder = {
    id: parentId,
    name: 'root',
    fileType: 'folder',
    children: ['file-1']
  };

  const createState = (files = [parentFolder, sourceFile]) => ({
    files,
    project: {
      id: projectId
    }
  });

  it('duplicates a file and dispatches the expected actions', async () => {
    const duplicatedFile = {
      id: 'file-2',
      name: 'sketch-(1).js',
      fileType: 'file',
      content: 'console.log("hello");',
      children: []
    };

    server.use(
      rest.post(`/projects/${projectId}/files`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json({
            updatedFile: duplicatedFile,
            project: {
              updatedAt: '2026-10-03T10:00:00.000Z'
            }
          })
        )
      )
    );

    const store = mockStore(createState());

    await store.dispatch(handleDuplicateFile('file-1', parentId));

    expect(store.getActions()).toEqual([
      createFile(duplicatedFile, parentId),
      setProjectSavedTime('2026-10-03T10:00:00.000Z'),
      setUnsavedChanges(true),
      setSelectedFile('file-2')
    ]);
  });

  it('preserves the url when duplicating an uploaded file', async () => {
    const source = {
      ...sourceFile,
      name: 'image.png',
      content: '',
      url: 'https://example.com/image.png'
    };

    const duplicatedFile = {
      id: 'file-2',
      name: 'image-(1).png',
      fileType: 'file',
      content: '',
      url: 'https://example.com/image.png',
      children: []
    };

    server.use(
      rest.post(`/projects/${projectId}/files`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json({
            updatedFile: duplicatedFile,
            project: {
              updatedAt: '2026-10-03T10:00:00.000Z'
            }
          })
        )
      )
    );

    const store = mockStore(createState([parentFolder, source]));

    await store.dispatch(handleDuplicateFile('file-1', parentId));

    expect(store.getActions()).toEqual([
      createFile(duplicatedFile, parentId),
      setProjectSavedTime('2026-10-03T10:00:00.000Z'),
      setUnsavedChanges(true),
      setSelectedFile('file-2')
    ]);
  });

  it('does nothing when the source file does not exist', async () => {
    const store = mockStore(createState());

    await store.dispatch(handleDuplicateFile('does-not-exist', parentId));

    expect(store.getActions()).toEqual([]);
  });

  it('does nothing when the source is a folder', async () => {
    const folder = {
      id: 'folder-2',
      name: 'components',
      fileType: 'folder',
      children: []
    };

    const store = mockStore(createState([parentFolder, sourceFile, folder]));

    await store.dispatch(handleDuplicateFile('folder-2', parentId));

    expect(store.getActions()).toEqual([]);
  });

  it('does nothing when parentId is missing', async () => {
    const store = mockStore(createState());

    await store.dispatch(handleDuplicateFile('file-1'));

    expect(store.getActions()).toEqual([]);
  });

  it('dispatches an error when the API request fails', async () => {
    const errorResponse = {
      message: 'Unable to create file'
    };

    server.use(
      rest.post(`/projects/${projectId}/files`, (_req, res, ctx) =>
        res(ctx.status(400), ctx.json(errorResponse))
      )
    );

    const store = mockStore(createState());

    const result = await store.dispatch(
      handleDuplicateFile('file-1', parentId)
    );

    expect(result).toEqual({
      error: expect.anything()
    });

    expect(store.getActions()).toContainEqual(createError(errorResponse));

    expect(store.getActions()).not.toContainEqual(
      createFile(expect.anything(), parentId)
    );
  });
});
