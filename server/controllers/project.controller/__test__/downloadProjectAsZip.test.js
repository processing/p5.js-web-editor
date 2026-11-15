import { Readable, Writable } from 'stream';
import JSZip from 'jszip';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import Project from '../../../models/project';
import safeProjectFileFetch from '../../../utils/safeProjectFileFetch';
import { downloadProjectAsZip } from '../../project.controller';

jest.mock('../../../models/project');
jest.mock('../../../utils/safeProjectFileFetch');
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  const MockS3Client = jest.fn().mockImplementation(() => ({ send: mockSend }));
  MockS3Client.mockSend = mockSend;
  return {
    S3Client: MockS3Client,
    GetObjectCommand: jest.fn().mockImplementation((input) => ({ input }))
  };
});

class TestResponse extends Writable {
  constructor() {
    super();
    this.chunks = [];
    this.headersSent = false;
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.headersSent = true;
  }

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  json(body) {
    this.body = body;
    this.end();
    return this;
  }
}

function makeProject(fileUrl) {
  const html =
    '<html><script src="https://cdn.example.test/library.js"></script></html>';
  return {
    name: 'Test sketch',
    visibility: 'Public',
    user: { toString: () => 'owner-123' },
    files: [
      {
        id: 'root',
        name: 'root',
        fileType: 'folder',
        children: ['index', 'asset']
      },
      { id: 'index', name: 'index.html', content: html },
      { id: 'asset', name: 'image.png', url: fileUrl }
    ]
  };
}

describe('downloadProjectAsZip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.S3_BUCKET = 'project-assets';
    process.env.AWS_REGION = 'us-west-2';
    delete process.env.S3_BUCKET_URL_BASE;
    S3Client.mockSend.mockReset();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('uses the safe fetcher for assets and bundles external scripts', async () => {
    const project = makeProject('https://assets.example.test/image.png');
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    safeProjectFileFetch.mockResolvedValue(Buffer.from('image bytes'));
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(safeProjectFileFetch).toHaveBeenCalledTimes(2);
    expect(safeProjectFileFetch).toHaveBeenCalledWith(
      'https://assets.example.test/image.png'
    );
    expect(safeProjectFileFetch).toHaveBeenCalledWith(
      'https://cdn.example.test/library.js'
    );
    expect(response.statusCode).toBe(200);
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(Object.keys(archive.files)).toEqual(
      expect.arrayContaining(['index.html', 'image.png'])
    );
    expect(archive.file('library.js')).not.toBeNull();
    expect(await archive.file('library.js').async('string')).toBe(
      'image bytes'
    );
    expect(await archive.file('index.html').async('string')).toBe(
      '<html><script src="https://cdn.example.test/library.js"></script></html>'
    );
  });

  it('preserves the root and normal nested directory structure', async () => {
    const project = {
      name: 'Nested sketch',
      visibility: 'Public',
      user: { toString: () => 'owner-123' },
      files: [
        { id: 'root', name: 'root', fileType: 'folder', children: ['src'] },
        { id: 'src', name: 'src', fileType: 'folder', children: ['helper'] },
        { id: 'helper', name: 'helper.js', content: 'const ok = true;' }
      ]
    };
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('src/helper.js').async('string')).toBe(
      'const ok = true;'
    );
    expect(archive.file('root/src/helper.js')).toBeNull();
  });

  it.each([
    '../../etc/passwd',
    '../../../../etc/passwd',
    '..\\..\\etc\\passwd',
    '/absolute.txt',
    'C:\\Windows\\system.txt',
    'mixed/..\\escape.txt',
    'bad:name.txt',
    'null\u0000byte.txt',
    'control\u0001byte.txt'
  ])('fails closed for legacy unsafe ZIP entry names: %s', async (name) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const project = {
      name: 'Unsafe legacy sketch',
      visibility: 'Public',
      user: { toString: () => 'owner-123' },
      files: [
        { id: 'root', name: 'root', fileType: 'folder', children: ['folder'] },
        { id: 'folder', name: 'src', fileType: 'folder', children: ['bad'] },
        { id: 'bad', name, content: 'payload' }
      ]
    };
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(response.statusCode).toBe(500);
    expect(response.headersSent).toBe(false);
    expect(response.body.message).toBe(
      'Failed to generate zip file. Please try again.'
    );
  });

  it('treats a nested folder named root as a normal folder', async () => {
    const project = {
      name: 'Nested root sketch',
      visibility: 'Public',
      user: { toString: () => 'owner-123' },
      files: [
        { id: 'root', name: 'root', fileType: 'folder', children: ['subroot'] },
        { id: 'subroot', name: 'root', fileType: 'folder', children: ['file'] },
        { id: 'file', name: 'inside.js', content: 'nested' }
      ]
    };
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('root/inside.js').async('string')).toBe('nested');
  });

  it('adds an empty placeholder when the safe fetcher blocks an asset', async () => {
    const project = makeProject('http://127.0.0.1/private.png');
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    safeProjectFileFetch.mockRejectedValue(
      new Error('Project file host is not public')
    );
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(safeProjectFileFetch).toHaveBeenCalledWith(
      'http://127.0.0.1/private.png'
    );
    expect(response.statusCode).toBe(200);
    expect(response.headersSent).toBe(true);
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('image.png').async('nodebuffer')).toHaveLength(0);
  });

  it.each([
    'https://s3.us-west-2.amazonaws.com/project-assets/owner-123/image.png',
    'https://s3-us-west-2.amazonaws.com/project-assets/owner-123/image.png'
  ])(
    'reads a valid application S3 asset from the configured bucket and owner prefix: %s',
    async (assetUrl) => {
      const project = makeProject(assetUrl);
      Project.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(project)
      });
      safeProjectFileFetch.mockResolvedValue(Buffer.from('library bytes'));
      S3Client.mockSend.mockResolvedValue({
        ContentLength: 8,
        Body: Readable.from([Buffer.from('s3 bytes')])
      });
      const response = new TestResponse();
      const finished = new Promise((resolve) => response.on('finish', resolve));

      await downloadProjectAsZip(
        { params: { project_id: 'project-123' } },
        response
      );
      await finished;

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'project-assets',
        Key: 'owner-123/image.png'
      });
      expect(S3Client.mockSend).toHaveBeenCalledTimes(1);
      expect(safeProjectFileFetch).toHaveBeenCalledWith(
        'https://cdn.example.test/library.js'
      );
      expect(safeProjectFileFetch).not.toHaveBeenCalledWith(assetUrl);
      const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
      expect(await archive.file('image.png').async('string')).toBe('s3 bytes');
      expect(await archive.file('library.js').async('string')).toBe(
        'library bytes'
      );
    }
  );

  it('uses the safe fetcher for a legacy flat-key S3 URL', async () => {
    const legacyUrl =
      'https://s3-us-west-2.amazonaws.com/project-assets/legacy-image.png';
    const project = makeProject(legacyUrl);
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    safeProjectFileFetch.mockResolvedValue(Buffer.from('legacy image bytes'));
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(S3Client.mockSend).not.toHaveBeenCalled();
    expect(safeProjectFileFetch).toHaveBeenCalledWith(legacyUrl);
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('image.png').async('string')).toBe(
      'legacy image bytes'
    );
  });

  it('uses the safe fetcher for a legacy virtual-hosted flat-key S3 URL', async () => {
    const legacyUrl =
      'https://project-assets.s3.us-west-2.amazonaws.com/legacy-image.png';
    const project = makeProject(legacyUrl);
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    safeProjectFileFetch.mockResolvedValue(Buffer.from('legacy image bytes'));
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(S3Client.mockSend).not.toHaveBeenCalled();
    expect(safeProjectFileFetch).toHaveBeenCalledWith(legacyUrl);
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('image.png').async('string')).toBe(
      'legacy image bytes'
    );
  });

  it('uses the safe fetcher for a same-bucket S3 URL outside the configured base', async () => {
    const alternateUrl =
      'https://project-assets.s3.us-west-2.amazonaws.com/owner-123/image.png';
    const project = makeProject(alternateUrl);
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    safeProjectFileFetch.mockResolvedValue(
      Buffer.from('alternate image bytes')
    );
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(S3Client.mockSend).not.toHaveBeenCalled();
    expect(safeProjectFileFetch).toHaveBeenCalledWith(alternateUrl);
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('image.png').async('string')).toBe(
      'alternate image bytes'
    );
  });

  it.each([
    'https://project-assets.s3.us-west-2.amazonaws.com/other-user/image.png',
    'https://project-assets.s3.us-west-2.amazonaws.com/owner-123/%2e%2e/private.png'
  ])(
    'rejects an alternate S3 URL with unauthorized or malformed key: %s',
    async (assetUrl) => {
      const project = makeProject(assetUrl);
      Project.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(project)
      });
      const response = new TestResponse();
      const finished = new Promise((resolve) => response.on('finish', resolve));

      await downloadProjectAsZip(
        { params: { project_id: 'project-123' } },
        response
      );
      await finished;

      expect(S3Client.mockSend).not.toHaveBeenCalled();
      expect(safeProjectFileFetch).not.toHaveBeenCalledWith(assetUrl);
      const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
      expect(await archive.file('image.png').async('nodebuffer')).toHaveLength(
        0
      );
    }
  );

  it('rejects an owner-prefixed S3 key belonging to another user', async () => {
    const unauthorizedUrl =
      'https://s3.us-west-2.amazonaws.com/project-assets/other-user/image.png';
    const project = makeProject(unauthorizedUrl);
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(S3Client.mockSend).not.toHaveBeenCalled();
    expect(safeProjectFileFetch).not.toHaveBeenCalledWith(unauthorizedUrl);
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('image.png').async('nodebuffer')).toHaveLength(0);
  });

  it('rejects an arbitrary S3 bucket instead of using SDK credentials or HTTP fetch', async () => {
    const project = makeProject(
      'https://attacker-bucket.s3.us-west-2.amazonaws.com/owner-123/image.png'
    );
    Project.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(project)
    });
    safeProjectFileFetch.mockResolvedValue(Buffer.from('library bytes'));
    const response = new TestResponse();
    const finished = new Promise((resolve) => response.on('finish', resolve));

    await downloadProjectAsZip(
      { params: { project_id: 'project-123' } },
      response
    );
    await finished;

    expect(S3Client.mockSend).not.toHaveBeenCalled();
    expect(safeProjectFileFetch).toHaveBeenCalledTimes(1);
    expect(safeProjectFileFetch).toHaveBeenCalledWith(
      'https://cdn.example.test/library.js'
    );
    expect(safeProjectFileFetch).not.toHaveBeenCalledWith(
      'https://attacker-bucket.s3.us-west-2.amazonaws.com/owner-123/image.png'
    );
    expect(response.statusCode).toBe(200);
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('image.png').async('nodebuffer')).toHaveLength(0);
  });
});
