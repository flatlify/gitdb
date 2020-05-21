import fsWithCallbacks from 'fs';
import fse from 'fs-extra';
import path from 'path';
import Collection from './collection';
import isoGit from 'isomorphic-git';
import findGitRoot from 'find-git-root';

const fs = fsWithCallbacks.promises;

interface Config {
  autoCommit?: boolean;
  cache?: string | null;
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
  static init(config: Config): GitDB {
    return new GitDB(config);
  }

  public async readDb(): Promise<schema> {
    const collectionDirectoryNames = await fs.readdir(this.config.dbDir);

    const collectionPromises = collectionDirectoryNames.map(
      async (collectionName) => {
        const collectionPath = `${this.config.dbDir}/${collectionName}`;

        const documentNames = await fs.readdir(collectionPath);
        const documentPromises = documentNames.map(async (documentName) => {
          const documentPath = `${collectionPath}/${documentName}`;
          const document = await fs.readFile(documentPath, 'utf8');
          const documentData = JSON.parse(document);
          this.collections[collectionName].insert(documentData, false);
        });
        await Promise.all(documentPromises);
      }
    );

    await Promise.all(collectionPromises);
    return this.collections;
  }

  public async createCollection(collectionName: string): Promise<string> {
    await fse.ensureDir(this.config.dbDir);
    this.collections[collectionName] = Collection.createCollection(
      collectionName,
      this
    );
    return collectionName;
  }

  public async list(): Promise<string[]> {
    const colletionNames = Object.keys(this.collections);
    return colletionNames;
  }

  public async delete(collectionName: string): Promise<string> {
    await fse.remove(`${this.config.dbDir}/${collectionName}`);
    delete this.collections[collectionName];
    return collectionName;
  }

  public async commit(
    filePaths: string[],
    message: string | undefined = '',
    remove: boolean,
    author: Author
  ): Promise<string[]> {
    const gitAddPromises = filePaths.map(async (filepath) => {
      const relativeFilePath = path.relative(this.gitRoot, filepath);
      if (!remove) {
        await isoGit.add({
          dir: this.gitRoot,
          filepath: relativeFilePath,
          fs: fsWithCallbacks
        });
      } else {
        await isoGit.remove({
          dir: this.gitRoot,
          filepath: relativeFilePath,
          fs
        });
      }
    });

    await Promise.all(gitAddPromises);
    const sha = await isoGit.commit({
      dir: this.gitRoot,
      author: {
        name: author.name,
        email: author.email
      },
      message,
      fs: fsWithCallbacks
    });
    return filePaths;
  }

  public async reset(files: string[] | undefined): Promise<void> {
    return Promise.resolve();
  }
}

export default GitDB;
