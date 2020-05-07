interface Record {
  id: string
}

interface Filter {

}

type SetCallback<T> = (record: T) => T;

type UpdateOrCallback<T, K extends T> = T | SetCallback<K>;

/**
 * TODO add immutablejs to prevent array mutation
 */
export default class Collection extends Array {
  public insert<T>(data: T): Promise<T & Record> {
    // TODO insert logic
    return Promise.resolve({...data, id: String(Math.random())});
  }

  public update<T, K extends T>(filter: Filter, dataOrCallback: UpdateOrCallback<T, K>): Promise<K> {
    // TODO insert logic
    return Promise.resolve({} as K);
  }

  public delete<T>(filter: Filter): Promise<Record[]> {
    // TODO insert logic
    return Promise.resolve([
      { id: String(Math.random()) }
    ]);
  }

  public find<T>(filter: Filter): T[] {
    return [];
  }
}
