import fsWithCallbacks from 'fs';
import fse from 'fs-extra';
const fs = fsWithCallbacks.promises;

interface Config {
  autoCommit: boolean;
  cache: string | null;
  dbDir: string;
}
type schema = Record<string, unknown[]>;
class GitDB {
  private config: Config;
  data: schema;

  constructor(config: Config) {
    this.config = config;
    this.data = {};
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
        this.data[collectionName] = [];
        const collectionPath = `${this.config.dbDir}/${collectionName}`;

        const documentNames = await fs.readdir(collectionPath);
        const documentPromises = documentNames.map(async (documentName) => {
          const documentPath = `${collectionPath}/${documentName}`;
          const document = await fs.readFile(documentPath, 'utf8');
          const documentData = JSON.parse(document);
          this.data[collectionName].push(documentData);
        });
        await Promise.all(documentPromises);
      }
    );

    await Promise.all(collectionPromises);
    return this.data;
  }

  public async create(collectionName: string): Promise<string> {
    await fs.mkdir(this.config.dbDir);
    this.data[collectionName] = [];
    return collectionName;
  }

  public async list(): Promise<string[]> {
    const colletionNames = Object.keys(this.data);
    return colletionNames;
  }

  public async delete(collectionName: string): Promise<string> {
    await fse.remove(`${this.config.dbDir}/${collectionName}`);
    delete this.data[collectionName];
    return collectionName;
  }

  public async commit(
    files: string[],
    message: string | undefined
  ): Promise<string[]> {
    // const gitAddPromises = filePaths.map(async (filepath) => {
    //   const relativeFilePath = path.relative(repositoryRoot, filepath);
    //   if (!remove) {
    //     await isoGit.add({ dir: repositoryRoot, filepath: relativeFilePath });
    //   } else {
    //     await isoGit.remove({
    //       dir: repositoryRoot,
    //       filepath: relativeFilePath
    //     });
    //   }
    // });
    // resolve(['todo: replace logic to return list of commited files'])
  }

  public async reset(files: string[] | undefined): Promise<void> {
    return Promise.resolve();
  }
}

export default GitDB;
