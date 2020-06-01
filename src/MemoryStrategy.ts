import { Filter, SetCallback, DBRecord } from './collection';

export class MemoryStrategy<T extends DBRecord> {
  private data: any[];

  constructor(data: any[]) {
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
    filter: Filter<K>,
    modifier: SetCallback<T>,
  ): Promise<boolean> {
    let updated = false;
    const newDocuments = this.data.filter(filter).map((document) => {
      updated = true;
      const documentId = document.id;
      const newDocument = { ...modifier(document), id: documentId };
      return newDocument;
    });
    this.data = newDocuments;
    return updated;
  }

  public async delete(filter: Filter<T>): Promise<boolean> {
    const newData = this.data.filter((document) =>
      // we want to delete filtered elements, not save them
      filter(document) ? false : true,
    );
    this.data = newData;
    return true;
  }
}
