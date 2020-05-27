import GitDB from './gitdb';
import { v4 as uuidv4 } from 'uuid';
import fse from 'fs-extra';
interface Record {
  id: string;
}

type Filter<T> = (document: T) => boolean;

type SetCallback<T> = (record: T) => T;
type UpdateOrCallback<T, K extends T> = T | SetCallback<K>;
export enum WriteToDisk {
  DO_NOT_WRITE_TO_DISK = 0,
  WRITE_TO_DISK = 1,
}

/**
 * TODO add immutablejs to prevent array and object mutation
 */
export default class Collection<T extends Record> {
  private db: GitDB;
  private name: string;
  private data: any[];
  get length(): number {
    return this.data.length;
  }

  constructor(gitDb: GitDB, name: string) {
    this.db = gitDb;
    this.name = name;
    this.data = [];
  }

  public async getData(callback: Filter<T>): T[] {
    const collection = this.db.config.cache
      ? this
      : await this.db.readCollection(this.name, true);

    if (typeof callback === 'function') {
      return collection.data.filter(callback);
    } else {
      return collection.data;
    }
  }

  public async insert(
    documentData: T,
    writeToDisk: WriteToDisk = WriteToDisk.WRITE_TO_DISK,
  ): Promise<T> {
    const newDocument = { id: uuidv4(), ...documentData };
    if (this.db.config.cache) {
      this.data.push(newDocument);
    }
    const filePath = `${this.db.config.dbDir}/${this.name}/${newDocument.id}.json`;
    if (writeToDisk) {
      this.db.commit([filePath], false, { email: 'email', name: 'author' });
      fse.outputJson(filePath, newDocument);
    }
    return newDocument;
  }

  public async update<K extends T>(
    filter: Filter<K>,
    dataOrCallback: UpdateOrCallback<T, K>,
  ): Promise<boolean> {
    const newDataPromises = this.data.map(async (document) => {
      if (filter(document)) {
        if (typeof dataOrCallback === 'function') {
          return dataOrCallback(document);
        }
        if (typeof dataOrCallback !== 'function') {
          const filePath = `${this.db.config.dbDir}/${this.name}/${dataOrCallback.id}.json`;
          this.db.commit([filePath], false, { email: 'email', name: 'author' });
          fse.outputJson(filePath, dataOrCallback);
          return dataOrCallback;
        }
      } else {
        return document;
      }
    });
    const newData = await Promise.all(newDataPromises);
    if (this.db.config.cache) {
      this.data = newData;
    }
    return true;
  }

  public async delete(filter: Filter<T>): Promise<boolean> {
    const newData = this.data.filter(async (document) => {
      if (filter(document)) {
        const filePath = `${this.db.config.dbDir}/${this.name}/${document.id}.json`;
        this.db.commit([filePath], true, { email: 'email', name: 'author' });
        await fse.remove(filePath);
        return false;
      } else {
        return true;
      }
    });
    if (this.db.config.cache) {
      this.data = newData;
    }
    return true;
  }
}
