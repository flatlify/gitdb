import * as fsWithCallbacks from 'fs';
import fse from 'fs-extra';
import path from 'path';
import isoGit from 'isomorphic-git';
import findGitRoot from 'find-git-root';
import { Collection } from '../Collection';
import { FileStrategy } from '../CollectionStrategies';
import { MemoryStrategy } from '../CollectionStrategies';

const fs = fsWithCallbacks.promises;
interface Config {
  autoCommit?: boolean;
  cache: boolean;
  dbDir: string;
}
interface Author {
  name: string;
  email: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type schema = Record<string, Collection<any>>;
export class GitDB {
  config: Config;
  collections: schema;
  gitRoot: string;

  constructor(config: Config) {
    this.config = config;
    this.collections = {};
    /** ".." because it returns `path/to/file/.git` */
    this.gitRoot = path.resolve(findGitRoot(config.dbDir), '..');
  }

  /**
   * Instantiates GitDB with a given config
   * @param config
   */
  async init(): Promise<void> {
    const collectionDirectoryNames = await fs.readdir(this.config.dbDir);
    const collectionPromises = collectionDirectoryNames.map(
      async (collectionName) => {
        this.loadCollection(collectionName);
      },
    );
    await Promise.all(collectionPromises);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(collectionName: string): Collection<any> {
    return this.collections[collectionName];
  }

  public async createCollection(collectionName: string): Promise<string> {
    await fse.mkdir(path.resolve(this.config.dbDir, collectionName));
    return this.initCollection(collectionName);
  }

  private async loadCollection(collectionName: string): Promise<string> {
    return this.initCollection(collectionName);
  }

  private async initCollection(collectionName: string): Promise<string> {
    const fileStrategy = new FileStrategy(
      path.resolve(this.config.dbDir, collectionName),
    );
    let memoryStrategy;
    if (this.config.cache) {
      const data = await fileStrategy.getAll();
      memoryStrategy = new MemoryStrategy(data);
    }
    this.collections[collectionName] = new Collection(
      this,
      collectionName,
      fileStrategy,
      memoryStrategy,
    );

    return collectionName;
  }
  public list(): string[] {
    return Object.keys(this.collections);
  }

  public async delete(collectionName: string): Promise<string> {
    const collection = await this.collections[collectionName];
    if (!collection) {
      throw { msg: "Collection doesn't exist" };
    }
    collection.delete(() => true);
    await fse.remove(`${this.config.dbDir}/${collectionName}`);

    delete this.collections[collectionName];
    return collectionName;
  }

  public async add(filePaths: string[]): Promise<void> {
    const gitAddPromises = filePaths.map(async (filepath) => {
      const relativeFilePath = path.relative(this.gitRoot, filepath);
      await isoGit.add({
        dir: this.gitRoot,
        filepath: relativeFilePath,
        fs,
      });
    });
    await Promise.all(gitAddPromises);
  }

  public async remove(filePaths: string[]): Promise<void> {
    const gitRmPromises = filePaths.map(async (filepath) => {
      const relativeFilePath = path.relative(this.gitRoot, filepath);
      await isoGit.remove({
        dir: this.gitRoot,
        filepath: relativeFilePath,
        fs,
      });
    });
    await Promise.all(gitRmPromises);
  }

  public async commit(userMessage: string | undefined = ''): Promise<string> {
    const relativeFilePaths: string[] = [];

    let message = userMessage;
    if (!message) {
      message = `Commit files: ${relativeFilePaths}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sha = await isoGit.commit({
      dir: this.gitRoot,
      message,
      fs: fsWithCallbacks,
    });
    return message;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async reset(files: string[] | undefined): Promise<void> {
    return Promise.resolve();
  }
}

export default GitDB;
