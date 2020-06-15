import * as fileUtils from '../src/utils/file';
import fsExtendedDependency from 'fs-extra';
import { promises as fsDependency } from 'fs';

describe('readFile', () => {
  test('Calls fs readFile', async () => {
    const documentName = 'documentExample';
    const collectionPath = '/collectionPath';
    const documentPath = `${collectionPath}/${documentName}`;

    const mockReadDocuments = jest.spyOn(fsDependency, 'readFile');
    mockReadDocuments.mockImplementation(async () => '{"id":4}');

    await fileUtils.readFile(collectionPath, documentName);

    expect(fsDependency.readFile).toBeCalledTimes(1);
    expect(fsDependency.readFile).toBeCalledWith(documentPath, 'utf8');

    mockReadDocuments.mockRestore();
  });
});

describe('readDocuments', () => {
  test('Calls fs readdir', async () => {
    const collectionPath = '/collectionPath';

    const mockReadDocuments = jest.spyOn(fsDependency, 'readdir');
    const mockReadFile = jest.spyOn(fileUtils, 'readFile');

    mockReadDocuments.mockImplementation(async () => []);
    mockReadFile.mockImplementation(async () => '');

    await fileUtils.readDocuments(collectionPath);

    expect(fsDependency.readdir).toBeCalledTimes(1);
    expect(fsDependency.readdir).toBeCalledWith(collectionPath);

    mockReadDocuments.mockRestore();
    mockReadFile.mockRestore();
  });

  test('Calls fss readdir', async () => {
    const collectionPath = '/collectionPath';

    const mockReadDocuments = jest.spyOn(fsDependency, 'readdir');
    const mockReadFile = jest.spyOn(fileUtils, 'readFile');

    mockReadDocuments.mockImplementation(async () => []);
    mockReadFile.mockImplementation(async () => '');

    await fileUtils.readDocuments(collectionPath);

    expect(fsDependency.readdir).toBeCalledTimes(1);
    expect(fsDependency.readdir).toBeCalledWith(collectionPath);

    mockReadDocuments.mockRestore();
    mockReadFile.mockRestore();
  });
});

describe('outputJson', () => {
  test('Calls fse outputJson', async () => {
    const filePath = '/path/to/file';
    const document = { id: 4 };

    const mockOutputJSON = jest.spyOn(fsExtendedDependency, 'outputJson');
    mockOutputJSON.mockImplementation(() => null);

    fileUtils.outputJson(filePath, document);

    expect(fsExtendedDependency.outputJson).toBeCalledTimes(1);
    expect(fsExtendedDependency.outputJson).toBeCalledWith(filePath, document);

    mockOutputJSON.mockRestore();
  });
});

describe('remove', () => {
  test('Call fse remove', async () => {
    const filePath = 'path/to/file';

    const mockReadDocuments = jest.spyOn(fsExtendedDependency, 'remove');
    mockReadDocuments.mockImplementation(async () => null);

    fileUtils.remove(filePath);

    expect(fsExtendedDependency.remove).toBeCalledTimes(1);
    expect(fsExtendedDependency.remove).toBeCalledWith(filePath);

    mockReadDocuments.mockRestore();
  });
});
