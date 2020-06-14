import { promises as fsDependency } from 'fs';
import GitDB from '../src/gitdb';

export const DB_DIR = '/dbDir';
export async function createMockDB(cache = false): Promise<GitDB> {
  const config = {
    cache,
    dbDir: DB_DIR,
  };
  const mockReadDir = jest
    .spyOn(fsDependency, 'readdir')
    .mockImplementation(async () => []);

  const gitDb = await GitDB.init(config);
  expect(fsDependency.readdir).toBeCalledTimes(1);
  mockReadDir.mockRestore();
  return gitDb;
}
