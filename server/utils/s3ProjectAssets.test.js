import { PassThrough, Readable } from 'stream';
import {
  getS3BaseUrl,
  hasConfiguredS3Origin,
  isS3Url,
  parseS3ProjectAssetUrl,
  readBoundedS3Object
} from './s3ProjectAssets';

describe('S3 project assets', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      AWS_REGION: 'us-west-2',
      S3_BUCKET: 'project-assets',
      S3_BUCKET_URL_BASE: 'https://cdn.example.test/assets/'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.useRealTimers();
  });

  it('accepts an internally generated URL under the configured base and owner prefix', () => {
    expect(
      parseS3ProjectAssetUrl(
        'https://cdn.example.test/assets/user-123/sketch.png',
        'user-123'
      )
    ).toEqual({ bucket: 'project-assets', key: 'user-123/sketch.png' });
  });

  it('recognizes only the configured S3 origin for SDK handling', () => {
    expect(hasConfiguredS3Origin('https://cdn.example.test/elsewhere')).toBe(
      true
    );
    expect(
      hasConfiguredS3Origin(
        'https://other.example.test/assets/user-123/file.png'
      )
    ).toBe(false);
  });

  it('identifies AWS S3 URLs so unconfigured buckets cannot use the HTTP path', () => {
    expect(
      isS3Url('https://other-bucket.s3.us-west-2.amazonaws.com/file.png')
    ).toBe(true);
    expect(isS3Url('https://assets.example.test/file.png')).toBe(false);
  });

  it('uses the existing default regional S3 URL format', () => {
    delete process.env.S3_BUCKET_URL_BASE;
    expect(getS3BaseUrl().href).toBe(
      'https://s3-us-west-2.amazonaws.com/project-assets/'
    );
    expect(
      parseS3ProjectAssetUrl(
        'https://s3-us-west-2.amazonaws.com/project-assets/user-123/sketch.png',
        'user-123'
      )
    ).toEqual({ bucket: 'project-assets', key: 'user-123/sketch.png' });
  });

  it.each([
    'https://other.example.test/assets/user-123/file.png',
    'https://s3-us-west-2.amazonaws.com/other-bucket/user-123/file.png',
    'https://cdn.example.test/other/user-123/file.png',
    'https://cdn.example.test/assets/other-user/file.png',
    'https://cdn.example.test/assets/user-123//file.png',
    'https://cdn.example.test/assets/user-123\\file.png',
    'https://cdn.example.test/assets/user-123/./file.png',
    'https://cdn.example.test/assets/user-123/../other/file.png',
    'https://cdn.example.test/assets/%2e%2e/user-123/file.png',
    'https://cdn.example.test/assets/user-123/%2e%2e/other.png',
    'https://cdn.example.test/assets/user-123%2f..%2fother/file.png',
    'https://cdn.example.test/assets/user-123/file.png?redirect=https://evil.test',
    'https://cdn.example.test/assets/user-123/file.png#fragment',
    'https://user:pass@cdn.example.test/assets/user-123/file.png',
    'https://cdn.example.test:8443/assets/user-123/file.png'
  ])('rejects an untrusted or malformed S3 URL: %s', (url) => {
    expect(() => parseS3ProjectAssetUrl(url, 'user-123')).toThrow();
  });

  it('bounds the S3 body size and aborts the request when it exceeds the limit', async () => {
    const body = new PassThrough();
    body.on('error', () => {});
    const startBody = () => {
      body.write(Buffer.alloc(25 * 1024 * 1024));
      body.write(Buffer.from('x'));
    };
    const client = { send: jest.fn().mockResolvedValue({ Body: body }) };
    const read = readBoundedS3Object(client, {});
    startBody();
    await expect(read).rejects.toThrow(/size limit/i);
    expect(body.destroyed).toBe(true);
    expect(client.send.mock.calls[0][1].abortSignal.aborted).toBe(true);
  });

  it('times out a stalled S3 body and destroys its stream', async () => {
    jest.useFakeTimers();
    const body = new Readable({ read() {} });
    const client = { send: jest.fn().mockResolvedValue({ Body: body }) };
    const read = readBoundedS3Object(client, {});
    const timeoutResult = expect(read).rejects.toThrow();
    await jest.advanceTimersByTimeAsync(10000);
    await timeoutResult;
    expect(body.destroyed).toBe(true);
    jest.useRealTimers();
  });

  it('rejects a known oversized S3 object before reading its body', async () => {
    const body = { destroy: jest.fn() };
    const client = {
      send: jest
        .fn()
        .mockResolvedValue({ ContentLength: 25 * 1024 * 1024 + 1, Body: body })
    };
    await expect(readBoundedS3Object(client, {})).rejects.toThrow(
      /size limit/i
    );
    expect(body.destroy).toHaveBeenCalled();
  });
});
