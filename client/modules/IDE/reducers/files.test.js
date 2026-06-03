import files from './files';
import * as ActionTypes from '../../../constants';

// Helper to build test state without dispatching actions
// Keeps DELETE_FILE tests isolated
function createTestState(fileDescriptors) {
  return fileDescriptors.map((f) => ({
    id: f.id,
    _id: f.id,
    name: f.name,
    content: f.content ?? '',
    fileType: f.fileType ?? 'file',
    children: f.children ?? [],
    parentId: f.parentId ?? null
  }));
}

describe('files reducer', () => {
  describe('DELETE_FILE action', () => {
    it('removes file and updates parent children array', () => {
      const state = createTestState([
        {
          id: 'root',
          name: 'root',
          fileType: 'folder',
          children: ['sketch', 'html', 'css']
        },
        {
          id: 'sketch',
          name: 'sketch.js',
          content: 'draw()',
          parentId: 'root'
        },
        { id: 'html', name: 'index.html', content: '<html>', parentId: 'root' },
        { id: 'css', name: 'style.css', content: 'body {}', parentId: 'root' }
      ]);

      const action = {
        type: ActionTypes.DELETE_FILE,
        id: 'sketch',
        parentId: 'root'
      };

      const newState = files(state, action);

      // File should be removed from state
      expect(newState.find((f) => f.id === 'sketch')).toBeUndefined();
      expect(newState).toHaveLength(state.length - 1);

      // Parent's children array should be updated
      const root = newState.find((f) => f.id === 'root');
      expect(root.children).not.toContain('sketch');
      expect(root.children).toHaveLength(2);

      // Siblings should still exist with unchanged content
      const htmlFile = newState.find((f) => f.id === 'html');
      const cssFile = newState.find((f) => f.id === 'css');
      expect(htmlFile).toBeDefined();
      expect(cssFile).toBeDefined();
      expect(htmlFile.content).toBe('<html>');
      expect(htmlFile.name).toBe('index.html');
      expect(cssFile.content).toBe('body {}');
    });

    it('recursively deletes folder and all descendants', () => {
      const state = createTestState([
        {
          id: 'root',
          name: 'root',
          fileType: 'folder',
          children: ['components']
        },
        {
          id: 'components',
          name: 'components',
          fileType: 'folder',
          children: ['button', 'input'],
          parentId: 'root'
        },
        { id: 'button', name: 'Button.jsx', parentId: 'components' },
        { id: 'input', name: 'Input.jsx', parentId: 'components' }
      ]);

      const action = {
        type: ActionTypes.DELETE_FILE,
        id: 'components',
        parentId: 'root'
      };

      const newState = files(state, action);

      // All three items should be deleted
      expect(newState.find((f) => f.id === 'components')).toBeUndefined();
      expect(newState.find((f) => f.id === 'button')).toBeUndefined();
      expect(newState.find((f) => f.id === 'input')).toBeUndefined();
      expect(newState).toHaveLength(state.length - 3);

      // Parent cleanup
      const root = newState.find((f) => f.id === 'root');
      expect(root.children).not.toContain('components');

      // No orphaned files, every non root file should be referenced in some parent's children array
      const referencedIds = new Set();
      newState.forEach((file) => {
        if (file.children) {
          file.children.forEach((childId) => referencedIds.add(childId));
        }
      });

      const nonRootFiles = newState.filter((f) => f.name !== 'root');
      nonRootFiles.forEach((file) => {
        expect(referencedIds.has(file.id)).toBe(true);
      });
    });

    it('handles deeply nested folder hierarchies', () => {
      const state = createTestState([
        {
          id: 'root',
          name: 'root',
          fileType: 'folder',
          children: ['src']
        },
        {
          id: 'src',
          name: 'src',
          fileType: 'folder',
          children: ['utils'],
          parentId: 'root'
        },
        {
          id: 'utils',
          name: 'utils',
          fileType: 'folder',
          children: ['helper'],
          parentId: 'src'
        },
        { id: 'helper', name: 'helper.js', parentId: 'utils' }
      ]);

      const action = {
        type: ActionTypes.DELETE_FILE,
        id: 'src',
        parentId: 'root'
      };

      const newState = files(state, action);

      // All three nested items should be deleted
      expect(newState.find((f) => f.id === 'src')).toBeUndefined();
      expect(newState.find((f) => f.id === 'utils')).toBeUndefined();
      expect(newState.find((f) => f.id === 'helper')).toBeUndefined();
      expect(newState).toHaveLength(state.length - 3);
    });

    it('handles empty folder deletion', () => {
      const state = createTestState([
        {
          id: 'root',
          name: 'root',
          fileType: 'folder',
          children: ['docs']
        },
        {
          id: 'docs',
          name: 'docs',
          fileType: 'folder',
          children: [],
          parentId: 'root'
        }
      ]);

      const action = {
        type: ActionTypes.DELETE_FILE,
        id: 'docs',
        parentId: 'root'
      };

      const newState = files(state, action);

      // Folder should be removed
      expect(newState.find((f) => f.id === 'docs')).toBeUndefined();

      // Parent should be updated
      const root = newState.find((f) => f.id === 'root');
      expect(root.children).not.toContain('docs');
    });
  });
});
