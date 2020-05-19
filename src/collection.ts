// import fsWithCallbacks from 'fs';
import GitDB from './gitdb';
// const fs = fsWithCallbacks.promises;
import fse from 'fs-extra';

interface Record {
  id: string;
}

interface Filter {
  id?: string;
}

type SetCallback<T> = (record: T) => T;

type UpdateOrCallback<T, K extends T> = T | SetCallback<K>;

/**
 * TODO add immutablejs to prevent array and object mutation
 */

export default class Collection<T extends Record> extends Array {
  private db: GitDB = new GitDB({ dbDir: '.' });
  private name = '';
  private data: any[] = [];
  constructor(props: any) {
    super();
  }

  private static handler: ProxyHandler<Collection<any>> = {
    get: (target, prop, receiver) => {
      /** probably not the best solution */
      const propAsNumber = Number(prop);
      if (isNaN(propAsNumber)) {
        if (Array.prototype.hasOwnProperty(prop)) {
          return Reflect.get(target.data, prop, target.data);
        }
        return Reflect.get(target, prop);
      } else {
        return target.data[propAsNumber];
      }
    }
  };

  public static createCollection(name: string, gitDB: GitDB): Collection<any> {
    // const collection = new Collection(name, gitDB);
    /** basic MyClass extends Array sets prototype to Array, not MyClass
     * @see https://blog.simontest.net/extend-array-with-typescript-965cc1134b3
     */
    const collection = Object.create(Collection.prototype);
    collection.db = gitDB;
    collection.name = name;
    collection.data = [];

    const collectionProxy = new Proxy(collection, Collection.handler);

    return collectionProxy;
  }

  public async insert(documentData: T): Promise<T> {
    const newDocument = { ...documentData, id: String(Math.random()) };
    this.data.push(documentData);
    const filePath = `${this.db.config.dbDir}/${this.name}/${newDocument.id}.json`;
    fse.outputJson(filePath, documentData);
    return newDocument;
  }

  public async update<K extends T>(
    filter: Filter,
    dataOrCallback: UpdateOrCallback<T, K>
  ): Promise<K> {
    const { id } = filter;
    if (typeof dataOrCallback !== 'function') {
      if (id) {
        const documentIndex = this.data.findIndex((e) => (e.id = id));
        this.data.splice(documentIndex, 1);
        this.data = [...this.data, dataOrCallback];
        const filePath = `${this.db.config.dbDir}/${this.name}/${dataOrCallback.id}.json`;
        fse.outputJson(filePath, dataOrCallback);
      }
    }
    return Promise.resolve({} as K);
  }

  public async delete(filter: Filter): Promise<boolean> {
    const { id } = filter;
    if (id) {
      const documentIndex = this.data.findIndex((e) => (e.id = id));
      this.data = [...this.data];
      this.data.splice(documentIndex, 1);
      const filePath = `${this.db.config.dbDir}/${this.name}/${id}.json`;
      await fse.remove(filePath);
      return true;
    }
    return false;
  }
}

const collection = Collection.createCollection(
  'name',
  new GitDB({ dbDir: '.' })
);

collection.insert((5 as unknown) as any);
collection.insert((4 as unknown) as any);
collection.insert(('dadad' as unknown) as any);
collection.insert(('aadad' as unknown) as any);
console.log(collection);
collection.sort();
console.log(collection);
// console.log(collection);
// collection.push(4)
// console.log(collection);

// console.log('qq', p[0], Object.getPrototypeOf(p), 'qq')
