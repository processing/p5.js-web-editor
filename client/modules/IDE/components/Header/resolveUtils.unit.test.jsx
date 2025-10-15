// resolveUtils.unit.test.jsx

import resolvePathsForElementsWithAttribute from '../../../../../server/utils/resolveUtils';
import { resolvePathToFile } from '../../../../../server/utils/filePath';

// Mock the dependencies
jest.mock('../../../../../server/utils/filePath', () => ({
  resolvePathToFile: jest.fn()
}));

jest.mock('../../../../../server/utils/fileUtils', () => ({
  MEDIA_FILE_REGEX: /\.(png|jpg|jpeg|gif|svg)$/i
}));

describe('resolvePathsForElementsWithAttribute', () => {
  let mockSketchDoc;
  let mockFiles;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock DOM environment
    mockSketchDoc = document.implementation.createHTMLDocument();
    mockFiles = {
      'image.png': { url: 'https://example.com/image.png' },
      'missing.jpg': { url: null }
    };

    resolvePathToFile.mockImplementation((fileName, files) => files[fileName]);
  });

  it('should update the attribute when the file is resolved successfully', () => {
    const element = mockSketchDoc.createElement('img');
    element.setAttribute('src', 'image.png');
    mockSketchDoc.body.appendChild(element);

    resolvePathsForElementsWithAttribute('src', mockSketchDoc, mockFiles);

    expect(element.getAttribute('src')).toBe('https://example.com/image.png');
  });

  it('should not update the attribute when the file resolution fails', () => {
    const element = mockSketchDoc.createElement('img');
    element.setAttribute('src', 'missing.jpg');
    mockSketchDoc.body.appendChild(element);

    resolvePathsForElementsWithAttribute('src', mockSketchDoc, mockFiles);

    expect(element.getAttribute('src')).toBe('missing.jpg');
  });

  it('should not update the attribute when the value does not match MEDIA_FILE_REGEX', () => {
    const element = mockSketchDoc.createElement('img');
    element.setAttribute('src', 'document.pdf');
    mockSketchDoc.body.appendChild(element);

    resolvePathsForElementsWithAttribute('src', mockSketchDoc, mockFiles);

    expect(element.getAttribute('src')).toBe('document.pdf');
  });

  it('should do nothing when no elements with the specified attribute are found', () => {
    resolvePathsForElementsWithAttribute('src', mockSketchDoc, mockFiles);

    expect(mockSketchDoc.querySelectorAll('[src]').length).toBe(0);
  });
});
