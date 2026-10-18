/**
 * @jest-environment node
 */
import Project from '../../models/project';
import { listObjectsInS3ForUser } from '../aws.controller';

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

describe('listObjectsInS3ForUser()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('excludes unreferenced (orphaned) S3 objects from totalSize', async () => {
    mockSend.mockResolvedValue({
      Contents: [
        { Key: 'user1/referenced.png', Size: 100 },
        { Key: 'user1/orphan.png', Size: 999 }
      ]
    });
    Project.getProjectsForUserId = jest.fn().mockResolvedValue([
      {
        id: 'project-1',
        name: 'sketch one',
        files: [
          {
            name: 'referenced.png',
            url: 'https://s3.example.com/user1/referenced.png'
          }
        ]
      }
    ]);

    const result = await listObjectsInS3ForUser('user1');

    expect(result.totalSize).toBe(100);
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].key).toBe('user1/referenced.png');
  });

  it('counts every object when they are all referenced', async () => {
    mockSend.mockResolvedValue({
      Contents: [
        { Key: 'user1/a.png', Size: 100 },
        { Key: 'user1/b.png', Size: 50 }
      ]
    });
    Project.getProjectsForUserId = jest.fn().mockResolvedValue([
      {
        id: 'project-1',
        name: 'sketch one',
        files: [
          { name: 'a.png', url: 'https://s3.example.com/user1/a.png' },
          { name: 'b.png', url: 'https://s3.example.com/user1/b.png' }
        ]
      }
    ]);

    const result = await listObjectsInS3ForUser('user1');

    expect(result.totalSize).toBe(150);
    expect(result.assets).toHaveLength(2);
  });
});
