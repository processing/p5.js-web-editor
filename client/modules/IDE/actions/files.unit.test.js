import { generateDuplicateFileName } from './files';

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
