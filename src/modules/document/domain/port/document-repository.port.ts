import { Document } from '../model/document.model';

export abstract class IDocumentRepositoryPort {
  abstract save(document: Document): Promise<Document>;
  abstract findById(id: string): Promise<Document | undefined>;
  abstract findByFileNameAndFileSize(
    fileName: string,
    fileSize: number,
  ): Promise<Document | undefined>;
  abstract update(document: Document): Promise<Document>;
}
