// import fsWithCallbacks from 'fs';
import Collection from './Collection';
import { FileStrategy } from '../CollectionStrategies/FileStrategy';
import { MemoryStrategy } from '../CollectionStrategies/MemoryStrategy';
import { createMockDB } from '../utils/createMockDB';
import * as fileDependency from '../utils/file';

jest.mock('../CollectionStrategies/FileStrategy');
jest.mock('../CollectionStrategies/MemoryStrategy');

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  //@ts-ignore
  FileStrategy.mockClear();
  //@ts-ignore
  MemoryStrategy.mockClear();
});

describe('constructor', () => {
  test('Works', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');
    const memoryStrategy = new MemoryStrategy([]);

    const collection = new Collection(
      gitDB,
      'name',
      fileStrategy,
      memoryStrategy,
    );

    expect(collection instanceof Collection).toBe(true);
  });
});

describe('getAll', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, 'name', fileStrategy);

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

    const collection = new Collection(
      gitDB,
      'name',
      fileStrategy,
      memoryStrategy,
    );

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

    const collection = new Collection(gitDB, 'name', fileStrategy);

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

    const collection = new Collection(
      gitDB,
      'name',
      fileStrategy,
      memoryStrategy,
    );

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

    const mockOutputJson = jest.spyOn(fileDependency, 'outputJson');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockOutputJson.mockImplementation(async () => {});

    const collection = new Collection(gitDB, 'name', fileStrategy);

    await collection.getAll();

    mockOutputJson.mockClear();
    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    // const fileStrategy = new FileStrategy('path');
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fileStrategy = { insert: () => ({}) };
    const memoryStrategy = new MemoryStrategy([]);

    const mockOutputJson = jest.spyOn(fileDependency, 'outputJson');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockOutputJson.mockImplementation(async () => {});
    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(
      gitDB,
      'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fileStrategy as unknown) as FileStrategy<any>,
      memoryStrategy,
    );

    await collection.insert(() => ({}));

    mockOutputJson.mockClear();
    expect(mockMemoryStrategyInstance.insert).toBeCalledTimes(1);
  });
});

describe('update', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, 'name', fileStrategy);

    await collection.getAll();

    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fileStrategy = { update: () => [] };
    const memoryStrategy = new MemoryStrategy([]);

    //@ts-ignore
    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(
      gitDB,
      'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fileStrategy as unknown) as FileStrategy<any>,
      memoryStrategy,
    );

    await collection.update(
      () => true,
      (e) => e,
    );

    expect(mockMemoryStrategyInstance.update).toBeCalledTimes(1);
  });
});

describe('delete', () => {
  test('Works with fileStrategy', async () => {
    const gitDB = await createMockDB();
    const fileStrategy = new FileStrategy('path');

    //@ts-ignore
    const mockFileStrategyInstance = FileStrategy.mock.instances[0];

    const collection = new Collection(gitDB, 'name', fileStrategy);

    await collection.getAll();

    expect(mockFileStrategyInstance.getAll).toBeCalledTimes(1);
  });

  test('Works with memoryStrategy', async () => {
    const gitDB = await createMockDB();
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fileStrategy = { delete: () => [] };
    const memoryStrategy = new MemoryStrategy([]);

    //@ts-ignore
    const mockMemoryStrategyInstance = MemoryStrategy.mock.instances[0];

    const collection = new Collection(
      gitDB,
      'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fileStrategy as unknown) as FileStrategy<any>,
      memoryStrategy,
    );

    await collection.delete(() => true);

    expect(mockMemoryStrategyInstance.delete).toBeCalledTimes(1);
  });
});
