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

  it('reads a valid application S3 asset from the configured bucket and owner prefix', async () => {
    const project = makeProject(
      'https://s3-us-west-2.amazonaws.com/project-assets/owner-123/image.png'
    );
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
    expect(safeProjectFileFetch).not.toHaveBeenCalledWith(
      'https://s3-us-west-2.amazonaws.com/project-assets/owner-123/image.png'
    );
    const archive = await JSZip.loadAsync(Buffer.concat(response.chunks));
    expect(await archive.file('image.png').async('string')).toBe('s3 bytes');
    expect(await archive.file('library.js').async('string')).toBe(
      'library bytes'
    );
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
