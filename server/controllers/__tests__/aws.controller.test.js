import Project from '../../models/project';

const mockSend = jest.fn();

jest.mock('../../models/project');
jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({
      send: (...args) => mockSend(...args)
    }))
  };
});

// Import after jest.mock
// eslint-disable-next-line import/first
import { listObjectsInS3ForUser } from '../aws.controller';

describe('aws.controller > listObjectsInS3ForUser', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      S3_BUCKET: 'test-bucket',
      S3_BUCKET_URL_BASE: 'https://test-bucket.s3.amazonaws.com/'
    };
    mockSend.mockReset();
    Project.getProjectsForUserId = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('includes unassociated assets in the returned assets list', async () => {
    // S3 contains one associated object and one unassociated object
    mockSend
      .mockResolvedValueOnce({
        Contents: [
          { Key: 'user-1/associated.png', Size: 1000 },
          { Key: 'user-1/unassociated.png', Size: 2500 }
        ]
      }) // savedData
      .mockResolvedValueOnce({ Contents: [] }); // pendingData

    // Only associated.png is referenced in a user sketch
    Project.getProjectsForUserId.mockResolvedValueOnce([
      {
        id: 'sketch-1',
        name: 'My Artwork',
        files: [
          {
            name: 'flower.png',
            url: 'https://test-bucket.s3.amazonaws.com/user-1/associated.png'
          }
        ]
      }
    ]);

    const result = await listObjectsInS3ForUser('user-1');

    expect(result).toBeDefined();
    expect(result.totalSize).toBe(3500);

    // Both assets should be returned
    expect(result.assets).toHaveLength(2);

    const associatedAsset = result.assets.find(
      (a) => a.key === 'user-1/associated.png'
    );
    expect(associatedAsset).toBeDefined();
    expect(associatedAsset.name).toBe('flower.png');
    expect(associatedAsset.sketchName).toBe('My Artwork');
    expect(associatedAsset.sketchId).toBe('sketch-1');

    const unassociatedAsset = result.assets.find(
      (a) => a.key === 'user-1/unassociated.png'
    );
    expect(unassociatedAsset).toBeDefined();
    expect(unassociatedAsset.name).toBe('unassociated.png');
    expect(unassociatedAsset.size).toBe(2500);
    expect(unassociatedAsset.sketchId).toBeUndefined();
    expect(unassociatedAsset.sketchName).toBeUndefined();
  });

  it('handles user with only unassociated assets', async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: [{ Key: 'user-2/orphan.mp3', Size: 4000 }]
      })
      .mockResolvedValueOnce({ Contents: [] });

    Project.getProjectsForUserId.mockResolvedValueOnce([]);

    const result = await listObjectsInS3ForUser('user-2');

    expect(result).toEqual({
      assets: [
        {
          key: 'user-2/orphan.mp3',
          name: 'orphan.mp3',
          size: 4000,
          url: 'https://test-bucket.s3.amazonaws.com/user-2/orphan.mp3'
        }
      ],
      totalSize: 4000
    });
  });

  it('handles user with no assets in S3', async () => {
    mockSend
      .mockResolvedValueOnce({ Contents: [] })
      .mockResolvedValueOnce({ Contents: [] });

    Project.getProjectsForUserId.mockResolvedValueOnce([]);

    const result = await listObjectsInS3ForUser('user-3');

    expect(result).toEqual({
      assets: [],
      totalSize: 0
    });
  });

  it('handles projects with missing or empty files array gracefully', async () => {
    mockSend
      .mockResolvedValueOnce({
        Contents: [{ Key: 'user-4/asset.png', Size: 500 }]
      })
      .mockResolvedValueOnce({ Contents: [] });

    Project.getProjectsForUserId.mockResolvedValueOnce([
      { id: 'sketch-empty', name: 'Empty Sketch' },
      { id: 'sketch-null-files', name: 'Null Files', files: null }
    ]);

    const result = await listObjectsInS3ForUser('user-4');

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].name).toBe('asset.png');
    expect(result.assets[0].sketchId).toBeUndefined();
  });
});
