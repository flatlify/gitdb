import fsModule from 'fs';
import fse from 'fs-extra';

const fs = fsModule.promises;

export function readFile(
  collectionPath: string,
): (value: string, index: number, array: string[]) => Promise<any> {
  return async (documentName): Promise<any> => {
    const documentPath = `${collectionPath}/${documentName}`;
    const document = await fs.readFile(documentPath, 'utf8');
    const documentData = JSON.parse(document);
    return documentData;
  };
}

export async function readDocuments(collectionPath: string): Promise<any[]> {
  const documentNames = await fs.readdir(collectionPath);

  const documentPromises = documentNames.map(readFile(collectionPath));
  const documents = await Promise.all(documentPromises);
  return documents;
}

export async function outputJson(
  filePath: string,
  documentData: any,
): Promise<void> {
  return fse.outputJson(filePath, documentData);
}

export async function remove(filePath: string): Promise<void> {
  return fse.remove(filePath);
}