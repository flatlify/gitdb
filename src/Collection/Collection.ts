import GitDB from '../GitDB/GitDB';
import { v4 as uuidv4 } from 'uuid';
import {
  FileStrategy,
  MemoryStrategy,
  Filter,
  SetCallback,
  CollectionStrategy,
} from '../CollectionStrategies';
import path from 'path';
export interface DBRecord {
  id: string;
}

enum gitStagingAreaStatus {
  add,
  remove,
}
/**
 * TODO add immutablejs to prevent array and object mutation
 */
export class Collection<T extends DBRecord> {
  private db: GitDB;
  private name: string;
  fileStrategy: CollectionStrategy<T>;
  memoryStrategy?: CollectionStrategy<T>;

  constructor(
    gitDb: GitDB,
    name: string,
    fileStrategy: FileStrategy<T>,
    memoryStrategy?: MemoryStrategy<T>,
  ) {
    this.db = gitDb;
    this.name = name;
    this.fileStrategy = fileStrategy;
    this.memoryStrategy = memoryStrategy;
  }

  public async getAll(): Promise<T[]> {
    const documents = this.memoryStrategy
      ? this.memoryStrategy.getAll()
      : this.fileStrategy.getAll();
    return documents;
  }

  public async getData(callback: Filter<T>): Promise<T[]> {
    const filteredDocuments = this.memoryStrategy
      ? this.memoryStrategy.getData(callback)
      : this.fileStrategy.getData(callback);

    return filteredDocuments;
  }

  public async insert(documentData: Omit<T, 'id'>): Promise<T> {
    const newDocument: T = { id: uuidv4(), ...documentData } as T;
    const document = await this.fileStrategy.insert(newDocument);
    const filePath = path.resolve(
      this.db.config.dbDir,
      this.name,
      `${document.id}.json`,
    );
    if (this.memoryStrategy) {
      this.memoryStrategy.insert(newDocument);
    }
    await this.checkForAutoCommit([filePath], gitStagingAreaStatus.add);

    return newDocument;
  }

  public async update<K extends T>(
    filter: Filter<T>,
    modifier: SetCallback<K, T>,
  ): Promise<K[]> {
    const documents = await this.fileStrategy.update(filter, modifier);

    if (this.memoryStrategy) {
      this.memoryStrategy.update(filter, modifier);
    }
    const filePaths = documents.map((document) =>
      path.resolve(this.db.config.dbDir, this.name, `${document.id}.json`),
    );
    await this.checkForAutoCommit(filePaths, gitStagingAreaStatus.add);
    return documents;
  }

  public async delete(filter: Filter<T>): Promise<T[]> {
    const documents = await this.fileStrategy.delete(filter);

    if (this.memoryStrategy) {
      this.memoryStrategy.delete(filter);
    }
    const filePaths = documents.map((document) =>
      path.resolve(this.db.config.dbDir, this.name, `${document.id}.json`),
    );
    await this.checkForAutoCommit(filePaths, gitStagingAreaStatus.remove);

    return documents;
  }

  private async checkForAutoCommit(
    filePaths: string[],
    addFile: gitStagingAreaStatus,
  ): Promise<boolean> {
    if (this.db.config.autoCommit) {
      if (addFile) {
        await this.db.add(filePaths);
      } else {
        await this.db.remove(filePaths);
      }
      await this.db.commit();
      return true;
    }
    return false;
  }
}

export default Collection;
