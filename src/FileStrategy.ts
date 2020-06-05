import GitDB from './gitdb';
import fse from 'fs-extra';
import { Filter, SetCallback, DBRecord } from './collection';
import path from 'path';

export class FileStrategy<T extends DBRecord> {
  private db: GitDB;
  private name: string;

  constructor(gitDb: GitDB, name: string) {
    this.db = gitDb;
    this.name = name;
  }

  public getAll(): Promise<T[]> {
    return this.db.readDocuments(this.name);
  }

  public async getData(callback: Filter<T>): Promise<T[]> {
    const documents = await this.db.readDocuments(this.name);
    return documents.filter(callback);
  }

  public async insert(documentData: T): Promise<string> {
    const filePath = path.resolve(
      this.db.config.dbDir,
      this.name,
      `${documentData.id}.json`,
    );
    fse.outputJson(filePath, documentData);

    return filePath;
  }

  public async update<K extends T>(
    filter: Filter<K>,
    modifier: SetCallback<T>,
  ): Promise<string[]> {
    const filePaths: string[] = [];

    const documents = await this.db.readDocuments(this.name);

    const newDataPromises = documents.filter(filter).map(async (document) => {
      const documentId = document.id;
      const newDocument = { ...modifier(document), id: documentId };

      const filePath = path.resolve(
        this.db.config.dbDir,
        this.name,
        `${documentId}.json`,
      );

      await fse.outputJson(filePath, newDocument);
      return newDocument;
    });

    await Promise.all(newDataPromises);
    return filePaths;
  }

  public async delete(filter: Filter<T>): Promise<string[]> {
    const removedPromises: any[] = [];
    const filePaths: string[] = [];

    const documents = await this.db.readDocuments(this.name);

    documents.filter(filter).map((document) => {
      const filePath = path.resolve(
        this.db.config.dbDir,
        this.name,
        `${document.id}.json`,
      );

      filePaths.push(filePath);
      const removedPromise = fse.remove(filePath);
      removedPromises.push(removedPromise);
    });
    await Promise.all(removedPromises);
    return filePaths;
  }
}
