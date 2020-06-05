import GitDB from './gitdb';
import { v4 as uuidv4 } from 'uuid';
import { FileStrategy } from './FileStrategy';
import { MemoryStrategy } from './MemoryStrategy';
export interface DBRecord {
  id: string;
}

export type Filter<T> = (document: T) => boolean;
export type SetCallback<T> = (record: T) => T;
enum gitStagingAreaStatus {
  add,
  remove,
}
/**
 * TODO add immutablejs to prevent array and object mutation
 */
export default class Collection<T extends DBRecord> {
  private db: GitDB;
  fileStrategy: FileStrategy<T>;
  memoryStrategy?: MemoryStrategy<T>;

  constructor(
    gitDb: GitDB,
    fileStrategy: FileStrategy<T>,
    memoryStrategy?: MemoryStrategy<T>,
  ) {
    this.db = gitDb;
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

  public async insert(documentData: T): Promise<T> {
    const newDocument = { id: uuidv4(), ...documentData };
    const filePath = await this.fileStrategy.insert(newDocument);

    if (this.memoryStrategy) {
      this.memoryStrategy.insert(newDocument);
    }
    await this.checkForAutoCommit([filePath], gitStagingAreaStatus.add);

    return newDocument;
  }

  public async update<K extends T>(
    filter: Filter<K>,
    modifier: SetCallback<T>,
  ): Promise<string[]> {
    const filePaths = await this.fileStrategy.update(filter, modifier);

    if (this.memoryStrategy) {
      this.memoryStrategy.update(filter, modifier);
    }
    await this.checkForAutoCommit(filePaths, gitStagingAreaStatus.add);
    return filePaths;
  }

  public async delete(filter: Filter<T>): Promise<string[]> {
    const filePaths = await this.fileStrategy.delete(filter);

    if (this.memoryStrategy) {
      this.memoryStrategy.delete(filter);
    }
    await this.checkForAutoCommit(filePaths, gitStagingAreaStatus.remove);

    return filePaths;
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
