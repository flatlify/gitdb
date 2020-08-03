import { promises as fsDependency } from 'fs';
import GitDB from '../GitDB/GitDB';

export const DB_DIR = '/dbDir';

/**
 * @TODO:
 * - move createMockDB to test file where it's used
 * - expect() call should be wrapped by a test
 * @param cache
 */
export async function createMockDB(cache = false): Promise<GitDB> {
  const config = {
    cache,
    dbDir: DB_DIR,
  };
  const mockReadDir = jest
    .spyOn(fsDependency, 'readdir')
    .mockImplementation(async () => []);

  const gitDb = new GitDB(config);
  await gitDb.init();
  expect(fsDependency.readdir).toBeCalledTimes(1);
  mockReadDir.mockRestore();
  return gitDb;
}
