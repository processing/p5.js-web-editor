import { EventEmitter } from 'events';
import dns from 'dns';
import http from 'http';
import https from 'https';
import safeProjectFileFetch from './safeProjectFileFetch';

function mockResponse(transport, responses) {
  jest
    .spyOn(transport, 'get')
    .mockImplementation((_url, _options, callback) => {
      const request = new EventEmitter();
      request.destroy = (error) => request.emit('error', error);
      const responseData = responses.shift();
      const response = new EventEmitter();
      response.statusCode = responseData.statusCode || 200;
      response.headers = responseData.headers || {};
      response.resume = jest.fn();
      response.destroy = jest.fn();
      callback(response);
      if (responseData.statusCode >= 300 && responseData.statusCode < 400)
        return request;
      if (responseData.chunks) {
        responseData.chunks.forEach((chunk) =>
          response.emit('data', Buffer.from(chunk))
        );
      }
      if (!responseData.hang) response.emit('end');
      return request;
    });
}

describe('safeProjectFileFetch', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it.each([
    ['http', 'http://8.8.8.8/file', http],
    ['https', 'https://8.8.8.8/file', https]
  ])('fetches a valid public %s URL', async (_name, url, transport) => {
    mockResponse(transport, [{ chunks: ['ok'] }]);
    await expect(safeProjectFileFetch(url)).resolves.toEqual(Buffer.from('ok'));
  });

  it.each([
    'not a url',
    'file:///etc/passwd',
    'ftp://8.8.8.8/file',
    'data:text/plain,hi',
    'http://user:pass@8.8.8.8/file',
    'http://8.8.8.8:8080/file',
    'http://8.8.8.8:80/file'
  ])('rejects malformed or unsupported URL %s', async (url) => {
    await expect(safeProjectFileFetch(url)).rejects.toThrow();
  });

  it.each([
    '0.0.0.0',
    '127.0.0.1',
    '168.63.129.16',
    '10.1.2.3',
    '100.64.0.1',
    '169.254.1.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.0.0.1',
    '192.0.2.1',
    '192.168.1.1',
    '198.18.0.1',
    '198.51.100.1',
    '203.0.113.1',
    '224.0.0.1',
    '240.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    'ff02::1',
    '2001:db8::1',
    '2001:2::1',
    '2001:10::1',
    '2002::1',
    '3fff::1',
    '3fff:800::1',
    '::ffff:127.0.0.1',
    '::ffff:10.0.0.1',
    '::ffff:7f00:1',
    '::ffff:a00:1'
  ])('rejects non-public address %s', async (address) => {
    await expect(
      safeProjectFileFetch(
        `http://${address.includes(':') ? `[${address}]` : address}/`
      )
    ).rejects.toThrow();
  });

  it('rejects the Azure platform IP before making an HTTP request', async () => {
    const requestSpy = jest.spyOn(http, 'get');

    await expect(
      safeProjectFileFetch('http://168.63.129.16/')
    ).rejects.toThrow();

    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('rejects localhost when DNS resolves it to loopback', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '::1', family: 6 }]);
    await expect(safeProjectFileFetch('http://localhost/')).rejects.toThrow();
  });

  it('rejects DNS failures and mixed public/non-public answers', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockRejectedValueOnce(new Error('DNS failure'))
      .mockResolvedValueOnce([
        { address: '8.8.8.8', family: 4 },
        { address: '127.0.0.1', family: 4 }
      ]);
    await expect(
      safeProjectFileFetch('https://asset.example/file')
    ).rejects.toThrow();
    await expect(
      safeProjectFileFetch('https://asset.example/file')
    ).rejects.toThrow();
  });

  it('allows a hostname only after resolving it to a public address', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    mockResponse(http, [{ chunks: ['ok'] }]);
    await expect(
      safeProjectFileFetch('http://assets.example/file')
    ).resolves.toEqual(Buffer.from('ok'));
  });

  it('follows a public redirect and rejects private, unsupported, and excessive redirects', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    mockResponse(http, [
      { statusCode: 302, headers: { location: 'https://cdn.example/file' } }
    ]);
    mockResponse(https, [{ chunks: ['ok'] }]);
    await expect(
      safeProjectFileFetch('http://asset.example/file')
    ).resolves.toEqual(Buffer.from('ok'));

    jest.restoreAllMocks();
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    mockResponse(http, [
      { statusCode: 302, headers: { location: 'http://127.0.0.1/' } }
    ]);
    await expect(
      safeProjectFileFetch('http://asset.example/file')
    ).rejects.toThrow();

    jest.restoreAllMocks();
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    mockResponse(http, [
      { statusCode: 302, headers: { location: 'ftp://cdn.example/file' } }
    ]);
    await expect(
      safeProjectFileFetch('http://asset.example/file')
    ).rejects.toThrow();

    jest.restoreAllMocks();
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    mockResponse(
      http,
      Array.from({ length: 4 }, () => ({
        statusCode: 302,
        headers: { location: '/again' }
      }))
    );
    await expect(
      safeProjectFileFetch('http://asset.example/file')
    ).rejects.toThrow(/redirect/i);
  });

  it.each([
    'http://10.0.0.1/',
    'http://169.254.1.1/',
    'http://169.254.169.254/'
  ])('rejects a redirect to a restricted address: %s', async (target) => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    mockResponse(http, [{ statusCode: 302, headers: { location: target } }]);
    await expect(
      safeProjectFileFetch('http://asset.example/file')
    ).rejects.toThrow();
  });

  it('rejects a redirect to the Azure platform IP before the second request', async () => {
    jest
      .spyOn(dns.promises, 'lookup')
      .mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
    mockResponse(http, [
      { statusCode: 302, headers: { location: 'http://168.63.129.16/' } }
    ]);

    await expect(
      safeProjectFileFetch('http://asset.example/file')
    ).rejects.toThrow();

    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('enforces request timeout, response size, and successful status codes', async () => {
    jest.useFakeTimers();
    jest.spyOn(http, 'get').mockImplementation((_url, _options, callback) => {
      const request = new EventEmitter();
      request.destroy = (error) => request.emit('error', error);
      return request;
    });
    const pendingFetch = safeProjectFileFetch('http://8.8.8.8/file');
    const timeoutResult = expect(pendingFetch).rejects.toThrow(/timed out/i);
    await jest.advanceTimersByTimeAsync(10000);
    await timeoutResult;

    jest.restoreAllMocks();
    jest.useRealTimers();
    mockResponse(http, [
      { headers: { 'content-length': `${25 * 1024 * 1024 + 1}` } }
    ]);
    await expect(safeProjectFileFetch('http://8.8.8.8/file')).rejects.toThrow(
      /too large|size limit/i
    );

    jest.restoreAllMocks();
    mockResponse(http, [{ statusCode: 404 }]);
    await expect(safeProjectFileFetch('http://8.8.8.8/file')).rejects.toThrow();
  });
});
