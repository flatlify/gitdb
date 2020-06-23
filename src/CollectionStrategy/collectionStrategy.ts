export type Filter<T> = (document: T) => boolean;
export type SetCallback<T> = (record: T) => T;

export interface CollectionStrategy<T> {
  getAll(): Promise<T[]>;
  getData(callback: Filter<T>): Promise<T[]>;
  insert(documentData: T): Promise<string>;
  update<K extends T>(
    filter: Filter<K>,
    modifier: SetCallback<T>,
  ): Promise<string[]>;
  delete(filter: Filter<T>): Promise<string[]>;
}
