export type Filter<T> = (document: T) => boolean;
export type SetCallback<K, T> = (record: T) => K;

export interface CollectionStrategy<T> {
  getAll(): Promise<T[]>;
  getData(callback: Filter<T>): Promise<T[]>;
  insert(documentData: T): Promise<T>;
  update<K extends T>(
    filter: Filter<T>,
    modifier: SetCallback<K, T>,
  ): Promise<K[]>;
  delete(filter: Filter<T>): Promise<T[]>;
}
