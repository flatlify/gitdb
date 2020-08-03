import { DBRecord } from '../Collection';
import { Filter, SetCallback, CollectionStrategy } from './CollectionStrategy';

export class MemoryStrategy<T extends DBRecord>
  implements CollectionStrategy<T> {
  private data: T[];

  constructor(data: T[]) {
    this.data = data || [];
  }

  public async getAll(): Promise<T[]> {
    return [...this.data];
  }

  public async getData(callback: Filter<T>): Promise<T[]> {
    return this.data.filter(callback);
  }

  public async insert(newDocument: T): Promise<T> {
    this.data = [...this.data, newDocument];
    return newDocument;
  }

  public async update<K extends T>(
    filter: Filter<T>,
    modifier: SetCallback<K, T>,
  ): Promise<K[]> {
    const updatedDocuments: K[] = [];
    this.data.filter(filter).forEach((document) => {
      const documentId = document.id;
      const newDocument = { ...modifier(document), id: documentId };
      for (const key in newDocument) {
        //@ts-ignore
        //? what to do with string any properties
        document[key] = newDocument[key];
      }
      updatedDocuments.push(newDocument);
    });
    return updatedDocuments;
  }

  public async delete(filter: Filter<T>): Promise<T[]> {
    const deleted = this.data.filter(filter);
    const newData = this.data.filter(
      (document) =>
        // we want to delete filtered elements, not save them
        !filter(document),
    );
    this.data = newData;
    return deleted;
  }
}
