
interface Config {
  autoCommit: boolean
  cache: string | null
}

class GitDB {

  private config: Config

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Instantiates GitDB with a given config
   * @param config
   */
  static init(config: Config): GitDB {
    return new GitDB(config);
  }

  public async create(collectionName: string): Promise<string> {
    return new Promise<string>(resolve => resolve('todo: replace logic to create collection and return its name'))
  }

  public async list(collectionName: string): Promise<string[]> {
    return new Promise<string[]>(resolve => resolve(['todo: replace logic to return list of collection names']))
  }

  public async delete(collectionName: string): Promise<string> {
    return new Promise<string>(resolve => resolve('todo: replace logic to delete collection and return its name'))
  }

  public async commit(files: string[], message: string | undefined): Promise<string[]> {
    return new Promise<string[]>(resolve => resolve(['todo: replace logic to return list of commited files']))
  }

  public async reset(files: string[] | undefined): Promise<void> {
    return Promise.resolve();
  }
}

export default GitDB;
