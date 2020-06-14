import fsWithCallbacks from 'fs';
import fse from 'fs-extra';
import path from 'path';
import Collection from './Collection';
import isoGit from 'isomorphic-git';
import findGitRoot from 'find-git-root';
import FileStrategy from './FileStrategy';
import MemoryStrategy from './MemoryStrategy';

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

type schema = Record<string, Collection<any>>;
class GitDB {
  config: Config;
  collections: schema;
  gitRoot: string;

  private constructor(config: Config) {
    this.config = config;
    this.collections = {};
    /** ".." because it returns `path/to/file/.git` */
    this.gitRoot = path.resolve(findGitRoot(config.dbDir), '..');
  }

  /**
   * Instantiates GitDB with a given config
   * @param config
   */
  static async init(config: Config): Promise<GitDB> {
    const gitDb = new GitDB(config);
    const collectionDirectoryNames = await fs.readdir(config.dbDir);
    const collectionPromises = collectionDirectoryNames.map(
      async (collectionName) => {
        gitDb.createCollection(collectionName);
      },
    );
    await Promise.all(collectionPromises);
    return gitDb;
  }

  public get(collectionName: string): Collection<any> {
    return this.collections[collectionName];
  }

  public async createCollection(collectionName: string): Promise<string> {
    await fse.ensureDir(path.resolve(this.config.dbDir, collectionName));
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
      fileStrategy,
      memoryStrategy,
    );

    return collectionName;
  }

  public list(): string[] {
    return Object.keys(this.collections);
  }

  public async delete(collectionName: string): Promise<string> {
    await this.collections[collectionName].delete(() => true);
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
    const sha = await isoGit.commit({
      dir: this.gitRoot,
      message,
      fs: fsWithCallbacks,
    });
    return message;
  }

  public async reset(files: string[] | undefined): Promise<void> {
    return Promise.resolve();
  }
}

export default GitDB;
