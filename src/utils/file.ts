import * as fsModule from 'fs';
import { outputJson as fseOutputJSON, remove as fseRemove } from 'fs-extra';

const fs = fsModule.promises;

export async function readFile(
  collectionPath: string,
  documentName: string,
): Promise<any> {
  const documentPath = `${collectionPath}/${documentName}`;
  const document = await fs.readFile(documentPath, 'utf8');
  const documentData = JSON.parse(document);
  return documentData;
}

export async function readDocuments<T>(collectionPath: string): Promise<T[]> {
  const documentNames = await fs.readdir(collectionPath);

  const documentPromises = documentNames.map((documentName) =>
    readFile(collectionPath, documentName),
  );
  const documents = await Promise.all(documentPromises);
  return documents;
}

export async function outputJson(
  filePath: string,
  documentData: any,
): Promise<void> {
  return fseOutputJSON(filePath, documentData);
}

export async function remove(filePath: string): Promise<void> {
  return fseRemove(filePath);
}
