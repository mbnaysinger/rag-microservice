import { Express } from 'express';

export abstract class IFileProcessingPort {
  abstract processFile(
    file: Express.Multer.File,
    documentId: string,
  ): Promise<string[]>;
}
