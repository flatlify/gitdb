import fsWithCallbacks from 'fs';
import fse from 'fs-extra';
import path from 'path';
import Collection, { WriteToDisk } from './collection';
import isoGit from 'isomorphic-git';
import findGitRoot from 'find-git-root';
const { DO_NOT_WRITE_TO_DISK } = WriteToDisk;

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
  static async init(config: Config): Promise<GitDB> {
    const gitDb = new GitDB(config);

    if (gitDb.config.cache) {
      const collectionDirectoryNames = await fs.readdir(config.dbDir);
      const collectionPromises = collectionDirectoryNames.map(
        async (collectionName) => {
          await gitDb.readCollection(collectionName, true);
        },
      );
      await Promise.all(collectionPromises);
    }
    return gitDb;
  }

  async readCollection(
    collectionName: string,
    cache: boolean,
  ): Promise<Collection<any>> {
    const collectionPath = `${this.config.dbDir}/${collectionName}`;
    const documentNames = await fs.readdir(collectionPath);

    const collection = cache
      ? this.collections[collectionName]
      : new Collection(this, collectionName);

    const documentPromises = documentNames.map(
      this.readFiles(collectionPath, collection),
    );

    await Promise.all(documentPromises);
    return collection;
  }

  private readFiles(
    collectionPath: string,
    collection: Collection<any>,
  ): (value: string, index: number, array: string[]) => Promise<void> {
    return async (documentName): Promise<void> => {
      const documentPath = `${collectionPath}/${documentName}`;
      const document = await fs.readFile(documentPath, 'utf8');
      const documentData = JSON.parse(document);

      collection.insert(documentData, DO_NOT_WRITE_TO_DISK);
    };
  }

  public async getCollection(collectionName: string): Promise<Collection<any>> {
    if (this.config.cache) {
      return this.collections[collectionName];
    } else {
      const collection = this.readCollection(collectionName, this.config.cache);
      return collection;
    }
  }

  public async createCollection(collectionName: string): Promise<string> {
    await fse.ensureDir(this.config.dbDir);
    if (this.config.cache) {
      this.collections[collectionName] = new Collection(this, collectionName);
    }
    return collectionName;
  }

  public async getCollectionsList(): Promise<string[]> {
    if (this.config.cache) {
      return Object.keys(this.collections);
    } else {
      return await fs.readdir(this.config.dbDir);
    }
  }

  public async delete(collectionName: string): Promise<string> {
    await fse.remove(`${this.config.dbDir}/${collectionName}`);
    if (this.config.cache) {
      delete this.collections[collectionName];
    }
    return collectionName;
  }

  public async commit(
    filePaths: string[],
    remove: boolean,
    author: Author,
    userMessage: string | undefined = '',
  ): Promise<string[]> {
    const relativeFilePaths: string[] = [];
    const gitAddPromises = filePaths.map(async (filepath) => {
      const relativeFilePath = path.relative(this.gitRoot, filepath);
      relativeFilePaths.push(relativeFilePath);
      if (remove) {
        await isoGit.remove({
          dir: this.gitRoot,
          filepath: relativeFilePath,
          fs,
        });
      } else {
        await isoGit.add({
          dir: this.gitRoot,
          filepath: relativeFilePath,
          fs: fsWithCallbacks,
        });
      }
    });
    let message = userMessage;
    if (!message) {
      if (remove) {
        message = `Deleted files: ${relativeFilePaths}`;
      } else {
        message = `Added files: ${relativeFilePaths}`;
      }
    }

    await Promise.all(gitAddPromises);
    const sha = await isoGit.commit({
      dir: this.gitRoot,
      author: {
        name: author.name,
        email: author.email,
      },
      message,
      fs: fsWithCallbacks,
    });
    return filePaths;
  }

  public async reset(files: string[] | undefined): Promise<void> {
    return Promise.resolve();
  }
}

export default GitDB;
