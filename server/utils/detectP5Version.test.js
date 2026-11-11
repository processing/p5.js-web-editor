import {
  CUSTOM_P5_VERSION,
  compareP5Versions,
  detectP5VersionFromFiles,
  detectP5VersionFromHtml
} from '../../common/detectP5Version';
import { currentP5Version } from '../../common/p5Versions';

describe('detectP5VersionFromHtml', () => {
  it('returns Custom for empty or missing html', () => {
    expect(detectP5VersionFromHtml('')).toBe(CUSTOM_P5_VERSION);
    expect(detectP5VersionFromHtml(null)).toBe(CUSTOM_P5_VERSION);
    expect(detectP5VersionFromHtml(undefined)).toBe(CUSTOM_P5_VERSION);
  });

  it('detects a jsDelivr p5 CDN version', () => {
    const html = `
      <html><head>
        <script src="https://cdn.jsdelivr.net/npm/p5@${currentP5Version}/lib/p5.js"></script>
      </head></html>
    `;
    expect(detectP5VersionFromHtml(html)).toBe(currentP5Version);
  });

  it('detects a cdnjs p5 CDN version', () => {
    const html = `
      <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.13/p5.min.js"></script>
    `;
    expect(detectP5VersionFromHtml(html)).toBe('1.11.13');
  });

  it('returns Custom for unrecognized CDN versions', () => {
    const html = `
      <script src="https://cdn.jsdelivr.net/npm/p5@9.9.9/lib/p5.js"></script>
    `;
    expect(detectP5VersionFromHtml(html)).toBe(CUSTOM_P5_VERSION);
  });

  it('returns Custom when multiple known p5 scripts are present', () => {
    const html = `
      <script src="https://cdn.jsdelivr.net/npm/p5@2.0.0/lib/p5.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/p5.js"></script>
    `;
    expect(detectP5VersionFromHtml(html)).toBe(CUSTOM_P5_VERSION);
  });

  it('returns Custom when no p5 script tag is present', () => {
    expect(detectP5VersionFromHtml('<html><body></body></html>')).toBe(
      CUSTOM_P5_VERSION
    );
  });
});

describe('detectP5VersionFromFiles', () => {
  it('reads version from index.html content', () => {
    const files = [
      {
        name: 'index.html',
        content: `<script src="https://cdn.jsdelivr.net/npm/p5@${currentP5Version}/lib/p5.min.js"></script>`
      },
      { name: 'sketch.js', content: 'function setup() {}' }
    ];
    expect(detectP5VersionFromFiles(files)).toBe(currentP5Version);
  });

  it('returns Custom when index.html is missing', () => {
    expect(detectP5VersionFromFiles([{ name: 'sketch.js', content: '' }])).toBe(
      CUSTOM_P5_VERSION
    );
    expect(detectP5VersionFromFiles(null)).toBe(CUSTOM_P5_VERSION);
  });
});

describe('compareP5Versions', () => {
  it('orders semver numerically', () => {
    expect(compareP5Versions('1.9.0', '1.11.0')).toBeLessThan(0);
    expect(compareP5Versions('2.0.0', '1.11.13')).toBeGreaterThan(0);
  });

  it('sorts Custom after numbered versions', () => {
    expect(compareP5Versions(CUSTOM_P5_VERSION, '2.0.0')).toBeGreaterThan(0);
    expect(compareP5Versions('1.0.0', CUSTOM_P5_VERSION)).toBeLessThan(0);
  });
});
