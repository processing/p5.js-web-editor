import { toModel, transformFiles, FileValidationError } from '../Project';

jest.mock('../../utils/createId');

// TODO: File name validation
// TODO: File extension validation
//
describe('domain-objects/Project', () => {
  describe('toModel', () => {
    it('filters extra properties', () => {
      const params = {
        name: 'My sketch',
        extraThing: 'oopsie',
      };

      const model = toModel(params);

      expect(model.name).toBe('My sketch');
      expect(model.extraThing).toBeUndefined();
    });

    it('throws FileValidationError', () => {
      const params = {
        files: {
          'index.html': {} // missing content or url
        }
      };

      expect(() => toModel(params)).toThrowError(FileValidationError);
    });

    it('throws if files is not an object', () => {
      const params = {
        files: []
      };

      expect(() => toModel(params)).toThrowError(FileValidationError);
    });
  });

  describe('transformFiles', () => {
    beforeEach(() => {
      // eslint-disable-next-line global-require
      const { resetMockCreateId } = require('../../utils/createId');

      resetMockCreateId();
    });

    it('creates an empty root with no data', () => {
      const tree = {};

      expect(transformFiles(tree)).toEqual([{
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: []
      }]);
    });

    it('converts tree-shaped files into list', () => {
      const tree = {
        'index.html': {
          content: 'some contents',
        }
      };

      expect(transformFiles(tree)).toEqual([
        {
          _id: '0',
          fileType: 'folder',
          name: 'root',
          children: ['1']
        },
        {
          _id: '1',
          content: 'some contents',
          fileType: 'file',
          name: 'index.html'
        }
      ]);
    });

    it('uses file url over content', () => {
      const tree = {
        'script.js': {
          url: 'http://example.net/something.js'
        }
      };

      expect(transformFiles(tree)).toEqual([
        {
          _id: '0',
          fileType: 'folder',
          name: 'root',
          children: ['1']
        },
        {
          _id: '1',
          url: 'http://example.net/something.js',
          fileType: 'file',
          name: 'script.js'
        }
      ]);
    });

    it('creates folders', () => {
      const tree = {
        'a-folder': {
          files: {}
        },
      };

      expect(transformFiles(tree)).toEqual([
        {
          _id: '0',
          fileType: 'folder',
          name: 'root',
          children: ['1']
        },
        {
          _id: '1',
          children: [],
          fileType: 'folder',
          name: 'a-folder'
        }
      ]);
    });

    it('walks the tree processing files', () => {
      const tree = {
        'index.html': {
          content: 'some contents',
        },
        'a-folder': {
          files: {
            'data.csv': {
              content: 'this,is,data'
            },
            'another.txt': {
              content: 'blah blah'
            }
          }
        },
      };

      expect(transformFiles(tree)).toEqual([
        {
          _id: '0',
          fileType: 'folder',
          name: 'root',
          children: ['1', '2']
        },
        {
          _id: '1',
          name: 'index.html',
          fileType: 'file',
          content: 'some contents'
        },
        {
          _id: '2',
          name: 'a-folder',
          fileType: 'folder',
          children: ['3', '4']
        },
        {
          _id: '3',
          name: 'data.csv',
          fileType: 'file',
          content: 'this,is,data'
        },
        {
          _id: '4',
          name: 'another.txt',
          fileType: 'file',
          content: 'blah blah'
        }
      ]);
    });

    it('handles deep nesting', () => {
      const tree = {
        first: {
          files: {
            second: {
              files: {
                third: {
                  files: {
                    'hello.js': {
                      content: 'world!'
                    }
                  }
                }
              }
            }
          }
        },
      };

      expect(transformFiles(tree)).toEqual([
        {
          _id: '0',
          fileType: 'folder',
          name: 'root',
          children: ['1']
        },
        {
          _id: '1',
          name: 'first',
          fileType: 'folder',
          children: ['2']
        },
        {
          _id: '2',
          name: 'second',
          fileType: 'folder',
          children: ['3']
        },
        {
          _id: '3',
          name: 'third',
          fileType: 'folder',
          children: ['4']
        },
        {
          _id: '4',
          name: 'hello.js',
          fileType: 'file',
          content: 'world!'
        }
      ]);
    });


    it('allows duplicate names in different folder', () => {
      const tree = {
        'index.html': {
          content: 'some contents',
        },
        'data': {
          files: {
            'index.html': {
              content: 'different file'
            }
          }
        },
      };

      expect(transformFiles(tree)).toEqual([
        {
          _id: '0',
          fileType: 'folder',
          name: 'root',
          children: ['1', '2']
        },
        {
          _id: '1',
          name: 'index.html',
          fileType: 'file',
          content: 'some contents'
        },
        {
          _id: '2',
          name: 'data',
          fileType: 'folder',
          children: ['3']
        },
        {
          _id: '3',
          name: 'index.html',
          fileType: 'file',
          content: 'different file'
        }
      ]);
    });

    it('validates files', () => {
      const tree = {
        'index.html': {} // missing `content`
      };

      expect(() => transformFiles(tree)).toThrowError(FileValidationError);
    });

    it('collects all file validation errors', () => {
      const tree = {
        'index.html': {}, // missing `content`
        'something.js': {} // also missing `content`
      };

      try {
        transformFiles(tree);

        // Should not get here
        throw new Error('should have thrown before this point');
      } catch (err) {
        expect(err).toBeInstanceOf(FileValidationError);
        expect(err.files).toEqual([
          { name: 'index.html', message: 'missing \'url\' or \'content\'' },
          { name: 'something.js', message: 'missing \'url\' or \'content\'' }
        ]);
      }
    });
  });
});
