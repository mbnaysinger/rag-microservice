import { Express } from 'express';

export abstract class IDocumentStoragePort {
  abstract uploadFile(
    file: Express.Multer.File,
    blobName: string,
  ): Promise<string>;
}
