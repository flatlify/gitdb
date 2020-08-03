import { DBRecord } from '../Collection/Collection';
import path from 'path';
import { remove, readDocuments, outputJson } from '../utils/file';
import { Filter, SetCallback, CollectionStrategy } from './CollectionStrategy';

export class FileStrategy<T extends DBRecord> implements CollectionStrategy<T> {
  private collectionPath: string;

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  public getAll(): Promise<T[]> {
    return readDocuments(this.collectionPath);
  }

  public async getData(callback: Filter<T>): Promise<T[]> {
    const documents = await readDocuments<T>(this.collectionPath);
    return documents.filter(callback);
  }

  public async insert(documentData: T): Promise<T> {
    const filePath = path.resolve(
      this.collectionPath,
      `${documentData.id}.json`,
    );
    outputJson(filePath, documentData);

    return documentData;
  }

  public async update<K extends T>(
    filter: Filter<T>,
    modifier: SetCallback<K, T>,
  ): Promise<K[]> {
    const filePaths: string[] = [];
    const documents = await readDocuments<T>(this.collectionPath);
    const newDataPromises = (documents.filter(filter).map(async (document) => {
      const documentId = document.id;
      const newDocument = { ...modifier(document), id: documentId };

      const filePath = path.resolve(this.collectionPath, `${documentId}.json`);
      filePaths.push(filePath);
      await outputJson(filePath, newDocument);
      return newDocument;
    }) as unknown) as Promise<K>[];

    const newData = await Promise.all(newDataPromises);
    return newData;
  }

  public async delete(filter: Filter<T>): Promise<T[]> {
    const documents = await readDocuments<T>(this.collectionPath);

    const removedPromises = documents.filter(filter).map(async (document) => {
      const filePath = path.resolve(this.collectionPath, `${document.id}.json`);

      await remove(filePath);
      return document;
    });
    const removedDocuments = await Promise.all(removedPromises);
    return removedDocuments;
  }
}

export default FileStrategy;
