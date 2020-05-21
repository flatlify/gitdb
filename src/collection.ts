import GitDB from './gitdb';
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
export default class Collection<T extends Record> {
  private db: GitDB;
  private name: string;
  private data: any[];
  [n: number]: T;
  get length() {
    return this.data.length;
  }

  private constructor(gitDb: GitDB, name: string) {
    this.db = gitDb;
    this.name = name;
    this.data = [];
  }

  private static handler: ProxyHandler<Collection<any>> = {
    get: (target, prop, receiver) => {
      const propAsNumber = Number(prop);
      if (isNaN(propAsNumber)) {
        /** If it is method or property of collection, it's ok, else throws error  */
        if (
          /** @see https://eslint.org/docs/rules/no-prototype-builtins */
          Object.prototype.hasOwnProperty.call(Collection.prototype, prop) ||
          Object.prototype.hasOwnProperty.call(target, prop)
        ) {
          // Element implicitly has an 'any' type because index expression is not of type 'number'.
          // But we want to access methods & private properties, not a collection[NUMBER] value
          //@ts-ignore
          return target[prop];
        } else {
          throw `Property [${String(prop)}] of collection [${
            target.name
          }] is inaccessible`;
        }
      } else {
        return target.data[propAsNumber];
      }
    }
  };

  public static createCollection(name: string, gitDB: GitDB): Collection<any> {
    const collection = new Collection(gitDB, name);
    const collectionProxy = new Proxy(collection, Collection.handler);
    return collectionProxy;
  }

  public async insert(documentData: T, writeToDisk = true): Promise<T> {
    const newDocument = { id: String(Math.random()), ...documentData };
    this.data.push(newDocument);
    const filePath = `${this.db.config.dbDir}/${this.name}/${newDocument.id}.json`;
    if (writeToDisk) {
      fse.outputJson(filePath, newDocument);
    }
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
        const filePath = `${this.db.config.dbDir}/${this.name}/${id}.json`;
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
  public concat(...items: (T | ConcatArray<T>)[]): T[] {
    return this.data.concat(...items);
  }
  public join(separator?: string): string {
    return this.data.join(separator);
  }
  public reverse(): T[] {
    return this.data.reverse();
  }
  public slice(start?: number, end?: number): T[] {
    return this.data.slice(start, end);
  }
  public sort(compareFn?: (a: T, b: T) => number): Array<T> {
    const newArray = [...this.data];
    return newArray.sort(compareFn);
  }
  public indexOf(searchElement: T, fromIndex?: number): number {
    return this.indexOf(searchElement, fromIndex);
  }
  public lastIndexOf(searchElement: T, fromIndex?: number): number {
    return this.lastIndexOf(searchElement, fromIndex);
  }
  public every(
    callbackfn: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any
  ): boolean {
    return this.data.every(callbackfn, thisArg);
  }
  public some(
    callbackfn: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any
  ): boolean {
    return this.data.some(callbackfn, thisArg);
  }
  public map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any
  ): U[] {
    return this.data.map(callbackfn), thisArg;
  }
  public filter<S extends T>(
    callbackfn: (value: T, index: number, array: T[]) => value is S,
    thisArg?: any
  ): S[] {
    return this.data.filter(callbackfn, thisArg);
  }
  public reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: T[]
    ) => U,
    initialValue?: U
  ): U {
    return this.data.reduce(callbackfn, initialValue);
  }
  public reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: number,
      array: T[]
    ) => U,
    initialValue?: U
  ): U {
    return this.data.reduceRight(callbackfn, initialValue);
  }
  public includes(searchElement: T, fromIndex?: number): boolean {
    return this.data.includes(searchElement, fromIndex);
  }
  public values(): IterableIterator<T> {
    return this.data.values();
  }
  find<S extends T>(
    predicate: (this: void, value: T, index: number, obj: T[]) => value is S,
    thisArg?: any
  ): S | undefined {
    return this.data.find(predicate, thisArg);
  }
  findIndex(
    predicate: (value: T, index: number, obj: T[]) => unknown,
    thisArg?: any
  ): number {
    return this.data.findIndex(predicate, thisArg);
  }
}
