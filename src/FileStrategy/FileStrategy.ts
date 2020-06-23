import { DBRecord } from '../Collection/Collection';
import path from 'path';
import { remove, readDocuments, outputJson } from '../utils/file/file';
import { Filter, SetCallback } from '../CollectionStrategy/collectionStrategy';

export class FileStrategy<T extends DBRecord> {
  private collectionPath: string;

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  public getAll(): Promise<T[]> {
    return readDocuments(this.collectionPath);
  }

  public async getData(callback: Filter<T>): Promise<T[]> {
    const documents = await readDocuments(this.collectionPath);
    return documents.filter(callback);
  }

  public async insert(documentData: T): Promise<string> {
    const filePath = path.resolve(
      this.collectionPath,
      `${documentData.id}.json`,
    );
    outputJson(filePath, documentData);

    return filePath;
  }

  public async update<K extends T>(
    filter: Filter<K>,
    modifier: SetCallback<T>,
  ): Promise<string[]> {
    const filePaths: string[] = [];

    const documents = await readDocuments(this.collectionPath);
    const newDataPromises = documents.filter(filter).map(async (document) => {
      const documentId = document.id;
      const newDocument = { ...modifier(document), id: documentId };

      const filePath = path.resolve(this.collectionPath, `${documentId}.json`);

      await outputJson(filePath, newDocument);
      return newDocument;
    });

    await Promise.all(newDataPromises);
    return filePaths;
  }

  public async delete(filter: Filter<T>): Promise<string[]> {
    const removedPromises: any[] = [];
    const filePaths: string[] = [];

    const documents = await readDocuments(this.collectionPath);

    documents.filter(filter).map((document) => {
      const filePath = path.resolve(this.collectionPath, `${document.id}.json`);

      filePaths.push(filePath);
      const removedPromise = remove(filePath);
      removedPromises.push(removedPromise);
    });
    await Promise.all(removedPromises);
    return filePaths;
  }
}

export default FileStrategy;
