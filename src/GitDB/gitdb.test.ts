import Collection from '../Collection/Collection';
import { FileStrategy } from '../CollectionStrategies';
import fsExtendedDependency from 'fs-extra';
import { MemoryStrategy } from '../CollectionStrategies';
import GitDB from './GitDB';
import { promises as fsDependency, Dirent } from 'fs';
import isoGit from 'isomorphic-git';
import { createMockDB, DB_DIR } from '../utils/createMockDB';

jest.mock('../FileStrategy/FileStrategy');
jest.mock('../MemoryStrategy/MemoryStrategy');
jest.mock('../Collection/Collection');

describe('init', () => {
  test('Uses readdir', async () => {
    const config = {
      cache: false,
      dbDir: DB_DIR,
    };

    const mockReadDir = jest
      .spyOn(fsDependency, 'readdir')
      .mockImplementation(async () => []);

    const gitDb = new GitDB(config);
    await gitDb.init();

    expect(fsDependency.readdir).toBeCalledTimes(1);
    mockReadDir.mockRestore();
  });

  test('Creates collections', async () => {
    const config = {
      cache: false,
      dbDir: 'DB_DIR',
    };
    const collectionOne: Dirent = ('collectionOne' as unknown) as Dirent;
    const collectionTwo: Dirent = ('collectionTwo' as unknown) as Dirent;
    const mockReadDir = jest
      .spyOn(fsDependency, 'readdir')
      .mockImplementation(async () => [collectionOne, collectionTwo]);

    const mockReadCollection = jest
      .spyOn(GitDB.prototype, 'createCollection')
      .mockImplementation(async (collectionName) => collectionName);

    const gitDb = new GitDB(config);
    await gitDb.init();

    expect(GitDB.prototype.createCollection).toBeCalledTimes(2);
    expect(GitDB.prototype.createCollection).toHaveBeenNthCalledWith(
      1,
      collectionOne,
    );
    expect(GitDB.prototype.createCollection).toHaveBeenNthCalledWith(
      2,
      collectionTwo,
    );
    mockReadDir.mockRestore();
    mockReadCollection.mockRestore();
  });
});

describe('get', () => {
  test('Returns collection', async () => {
    const config = {
      cache: false,
      dbDir: 'DB_DIR',
    };

    const testCollection = {};

    const testCollectionName = 'collectionOne';
    const mockReadDir = jest
      .spyOn(fsDependency, 'readdir')
      .mockImplementation(async () => [
        (testCollectionName as unknown) as Dirent,
      ]);

    const mockReadCollection = jest
      .spyOn(GitDB.prototype, 'createCollection')
      .mockImplementation(async function (this: GitDB, collectionName) {
        this.collections[
          collectionName
        ] = (testCollection as unknown) as Collection<any>;
        return collectionName;
      });

    const gitDb = new GitDB(config);
    await gitDb.init();
    const receivedCollection = gitDb.get(testCollectionName);

    expect(receivedCollection).toBe(testCollection);

    mockReadDir.mockRestore();
    mockReadCollection.mockRestore();
  });
});

describe('createCollection', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    // @ts-ignore
    Collection.mockClear();
    //@ts-ignore
    FileStrategy.mockClear();
    //@ts-ignore
    MemoryStrategy.mockClear();
  });

  test('Calls ensureDir', async () => {
    const gitDB = await createMockDB();

    const mockEnsureDir = jest
      .spyOn(fsExtendedDependency, 'ensureDir')
      .mockImplementation(() => null);

    const testCollectionName = 'collectionOne';
    await gitDB.createCollection(testCollectionName);

    expect(fsExtendedDependency.ensureDir).toBeCalledTimes(1);
    expect(fsExtendedDependency.ensureDir).toBeCalledWith(
      `${DB_DIR}/${testCollectionName}`,
    );

    mockEnsureDir.mockRestore();
  });

  test('Creates only file strategy with cache off', async () => {
    const gitDB = await createMockDB();

    //! File & Memory strategies were mocked at the beginning of the file

    const mockEnsureDir = jest
      .spyOn(fsExtendedDependency, 'ensureDir')
      .mockImplementation(() => null);

    const testCollectionName = 'collectionOne';
    await gitDB.createCollection(testCollectionName);

    expect(FileStrategy).toBeCalledTimes(1);
    expect(FileStrategy).toBeCalledWith(`${DB_DIR}/${testCollectionName}`);
    expect(MemoryStrategy).toBeCalledTimes(0);

    mockEnsureDir.mockRestore();
  });

  test('Creates both file & memory strategies with cache on', async () => {
    const gitDB = await createMockDB(true);

    const mockEnsureDir = jest
      .spyOn(fsExtendedDependency, 'ensureDir')
      .mockImplementation(() => null);

    const testCollectionName = 'collectionOne';
    await gitDB.createCollection(testCollectionName);

    expect(FileStrategy).toBeCalledTimes(1);
    expect(FileStrategy).toBeCalledWith(`${DB_DIR}/${testCollectionName}`);
    expect(MemoryStrategy).toBeCalledTimes(1);

    mockEnsureDir.mockRestore();
  });

  test('Creates new Collection instance', async () => {
    const gitDB = await createMockDB(true);

    const mockEnsureDir = jest
      .spyOn(fsExtendedDependency, 'ensureDir')
      .mockImplementation(() => null);

    const testCollectionName = 'collectionOne';
    await gitDB.createCollection(testCollectionName);

    expect(Collection).toBeCalledTimes(1);

    mockEnsureDir.mockRestore();
  });
});

describe('list', () => {
  test('Returns collections names', async () => {
    const config = {
      cache: false,
      dbDir: 'DB_DIR',
    };
    const collectionOne = 'collectionOne';
    const collectionTwo = 'collectionTwo';
    const mockReadDir = jest
      .spyOn(fsDependency, 'readdir')
      .mockImplementation(async () => [
        (collectionOne as unknown) as Dirent,
        (collectionTwo as unknown) as Dirent,
      ]);

    const mockReadCollection = jest
      .spyOn(GitDB.prototype, 'createCollection')
      .mockImplementation(async function (this: GitDB, collectionName) {
        this.collections[
          collectionName
        ] = (collectionName as unknown) as Collection<any>;

        return collectionName;
      });

    const gitDB = new GitDB(config);
    await gitDB.init();

    const collectionNames = gitDB.list();

    expect(collectionNames[0]).toBe(collectionOne);
    expect(collectionNames[1]).toBe(collectionTwo);
    expect(collectionNames.length).toBe(2);

    mockReadDir.mockRestore();
    mockReadCollection.mockRestore();
  });
});

describe('delete', () => {
  test('Deletes collection', async () => {
    const gitDB = await createMockDB(true);

    const mockEnsureDir = jest
      .spyOn(fsExtendedDependency, 'ensureDir')
      .mockImplementation(() => null);
    const mockRemove = jest
      .spyOn(fsExtendedDependency, 'remove')
      .mockImplementation(async () => null);

    const testCollectionName = 'collectionOne';
    await gitDB.createCollection(testCollectionName);

    let collection = await gitDB.get(testCollectionName);

    expect(collection instanceof Collection).toBe(true);

    await gitDB.delete(testCollectionName);

    collection = await gitDB.get(testCollectionName);

    expect(collection).toBe(undefined);

    mockRemove.mockRestore();
    mockEnsureDir.mockRestore();
  });
});

describe('add', () => {
  test('Calls git add', async () => {
    const mockIsoGitAdd = jest
      .spyOn(isoGit, 'add')
      .mockImplementation(async () => (null as unknown) as void);

    const gitDB = await createMockDB(true);

    gitDB.add(['path/to/file']);

    expect(mockIsoGitAdd).toBeCalledTimes(1);

    mockIsoGitAdd.mockRestore();
  });
});

describe('Remove', () => {
  test('Calls git remove', async () => {
    const mockIsoGitRemove = jest
      .spyOn(isoGit, 'remove')
      .mockImplementation(async () => (null as unknown) as void);

    const gitDB = await createMockDB(true);

    gitDB.remove(['path/to/file']);

    expect(mockIsoGitRemove).toBeCalledTimes(1);

    mockIsoGitRemove.mockRestore();
  });
});

describe('Commit', () => {
  test('Calls git Commit', async () => {
    const mockIsoGitCommit = jest
      .spyOn(isoGit, 'commit')
      .mockImplementation(async () => 'commitSHA');

    const gitDB = await createMockDB(true);

    gitDB.commit();

    expect(mockIsoGitCommit).toBeCalledTimes(1);

    mockIsoGitCommit.mockRestore();
  });
});
