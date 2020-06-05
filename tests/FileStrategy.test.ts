import { MemoryStrategy } from '../src/MemoryStrategy';
import { FileStrategy } from '../src/FileStrategy';
import * as fileDependency from '../src/utils/file';

describe('getAll', () => {
  test('Call readDocuments function', async () => {
    const pathToFile = '/path/to/file';

    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    mockReadDocuments.mockImplementation(async () => {
      return [];
    });

    const fileStrategy = new FileStrategy(pathToFile);
    fileStrategy.getAll();

    expect(fileDependency.readDocuments).toBeCalledTimes(1);
    expect(fileDependency.readDocuments).toBeCalledWith(pathToFile);
    mockReadDocuments.mockRestore();
  });
});

describe('getData', () => {
  test('Call readDocuments function', async () => {
    const pathToFile = '/path/to/file';

    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    mockReadDocuments.mockImplementation(async () => {
      return [];
    });

    const fileStrategy = new FileStrategy(pathToFile);
    fileStrategy.getAll();

    expect(fileDependency.readDocuments).toBeCalledTimes(1);
    expect(fileDependency.readDocuments).toBeCalledWith(pathToFile);
    mockReadDocuments.mockRestore();
  });

  test('filterDocuments', async () => {
    const pathToFile = '/path/to/file';

    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    mockReadDocuments.mockImplementation(async () => {
      return [
        { id: '1' },
        { id: '3' },
        { id: '4' },
        { id: '25' },
        { id: '35' },
      ];
    });

    const fileStrategy = new FileStrategy(pathToFile);
    const filteredDocuments = await fileStrategy.getData(
      (e) => Number(e.id) > 4,
    );

    expect(filteredDocuments.length).toBe(2);

    mockReadDocuments.mockRestore();
  });
});

describe('insert', () => {
  test('Call outputJson function', async () => {
    const pathToFile = '/path/to/file';

    const mockOutputJson = jest.spyOn(fileDependency, 'outputJson');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockOutputJson.mockImplementation(async () => {});

    const document = { id: '24' };
    const fileStrategy = new FileStrategy(pathToFile);
    fileStrategy.insert(document);

    expect(fileDependency.outputJson).toBeCalledTimes(1);
    expect(fileDependency.outputJson).toBeCalledWith(
      `${pathToFile}/${document.id}.json`,
      document,
    );
    mockOutputJson.mockRestore();
  });
});

describe('update', () => {
  test('Call readDocuments function', async () => {
    const pathToFile = '/path/to/file';

    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    mockReadDocuments.mockImplementation(async () => {
      return [];
    });

    const fileStrategy = new FileStrategy(pathToFile);
    fileStrategy.update(
      (e) => e.id === '4',
      (e) => ({ ...e, number: 4 }),
    );

    expect(fileDependency.readDocuments).toBeCalledTimes(1);
    expect(fileDependency.readDocuments).toBeCalledWith(pathToFile);
    mockReadDocuments.mockRestore();
  });

  test('Call outputJson function', async () => {
    const pathToFile = '/path/to/file';

    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    mockReadDocuments.mockImplementation(async () => {
      return [{ id: '4' }];
    });

    const mockOutputJson = jest.spyOn(fileDependency, 'outputJson');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockOutputJson.mockImplementation(async () => {});

    const fileStrategy = new FileStrategy(pathToFile);
    await fileStrategy.update(
      (e) => e.id === '4',
      (e) => ({ ...e, number: 4 }),
    );

    expect(fileDependency.outputJson).toBeCalledTimes(1);
    mockReadDocuments.mockRestore();
    mockOutputJson.mockRestore();
  });

  test('Call modifier function', async () => {
    const pathToFile = '/path/to/file';
    const modifier = (e: any) => ({ ...e, number: 4 });

    const mockModifier = jest.fn(modifier);
    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    const mockOutputJson = jest.spyOn(fileDependency, 'outputJson');

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockOutputJson.mockImplementation(async () => {});

    const searchObject = { id: '4' };
    mockReadDocuments.mockImplementation(async () => {
      return [{ id: '1' }, searchObject];
    });

    const fileStrategy = new FileStrategy(pathToFile);
    await fileStrategy.update((e) => e.id === '4', mockModifier);

    expect(mockModifier).toBeCalledTimes(1);
    expect(mockModifier).toBeCalledWith(searchObject);

    mockReadDocuments.mockRestore();
    mockModifier.mockRestore();
    mockOutputJson.mockRestore();
  });
});

describe('delete', () => {
  test('Call readDocuments function', async () => {
    const pathToFile = '/path/to/file';

    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    mockReadDocuments.mockImplementation(async () => {
      return [];
    });

    const fileStrategy = new FileStrategy(pathToFile);
    fileStrategy.delete((e) => e.id === '4');

    expect(fileDependency.readDocuments).toBeCalledTimes(1);
    expect(fileDependency.readDocuments).toBeCalledWith(pathToFile);

    mockReadDocuments.mockRestore();
  });

  test('Call remove function', async () => {
    const pathToFile = '/path/to/file';

    const mockReadDocuments = jest.spyOn(fileDependency, 'readDocuments');
    mockReadDocuments.mockImplementation(async () => {
      return [{ id: '4' }];
    });

    const mockOutputJson = jest.spyOn(fileDependency, 'remove');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockOutputJson.mockImplementation(async () => {});

    const fileStrategy = new FileStrategy(pathToFile);
    await fileStrategy.delete((e) => e.id === '4');

    expect(fileDependency.outputJson).toBeCalledTimes(1);
    expect(fileDependency.outputJson).toBeCalledWith(`${pathToFile}/4.json`);

    mockReadDocuments.mockRestore();
    mockOutputJson.mockRestore();
  });
});
