// import fsWithCallbacks from 'fs';
import Collection from './Collection';
import FileStrategy from '../FileStrategy/FileStrategy';
import MemoryStrategy from '../MemoryStrategy/MemoryStrategy';
import { createMockDB } from '../helpers/testHelpers';

jest.mock('../FileStrategy/FileStrategy');
jest.mock('../MemoryStrategy/MemoryStrategy');

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  //@ts-ignore
  FileStrategy.mockClear();
  //@ts-ignore
  MemoryStrategy.mockClear();
});

const DB_DIR = '/dbDir';

describe('constructor', () => {
  test('Works', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');
    const memoryStrategy = new MemoryStrategy([]);

    const collection = new Collection(gitDB, fileStrategy, memoryStrategy);

    expect(collection instanceof Collection).toBe(true);
  });
});

describe('getAll', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy);

    await collection.getAll();

    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');
    const memoryStrategy = new MemoryStrategy([]);

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];
    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy, memoryStrategy);

    await collection.getAll();

    expect(mockMemoryStrategyInstance.getAll).toBeCalledTimes(1);
    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(0);
  });
});

describe('getData', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy);

    await collection.getAll();

    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');
    const memoryStrategy = new MemoryStrategy([]);

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];
    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy, memoryStrategy);

    await collection.getData(() => true);

    expect(mockMemoryStrategyInstance.getData).toBeCalledTimes(1);
    expect(mockFileStrategyInstance.getData).toBeCalledTimes(0);
  });
});

describe('insert', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy);

    await collection.getAll();

    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');
    const memoryStrategy = new MemoryStrategy([]);

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];
    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy, memoryStrategy);

    await collection.insert(() => true);

    expect(mockMemoryStrategyInstance.insert).toBeCalledTimes(1);
    expect(mockFileStrategyInstance.insert).toBeCalledTimes(1);
  });
});

describe('update', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy);

    await collection.getAll();

    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');
    const memoryStrategy = new MemoryStrategy([]);

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];
    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy, memoryStrategy);

    await collection.update(
      () => true,
      (e) => e,
    );

    expect(mockMemoryStrategyInstance.update).toBeCalledTimes(1);
    expect(mockFileStrategyInstance.update).toBeCalledTimes(1);
  });
});

describe('delete', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy);

    await collection.getAll();

    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');
    const memoryStrategy = new MemoryStrategy([]);

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];
    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(gitDB, fileStrategy, memoryStrategy);

    await collection.delete(() => true);

    expect(mockMemoryStrategyInstance.delete).toBeCalledTimes(1);
    expect(mockFileStrategyInstance.delete).toBeCalledTimes(1);
  });
});
