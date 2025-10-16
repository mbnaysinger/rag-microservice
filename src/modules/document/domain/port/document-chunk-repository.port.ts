import { DocumentChunk } from '../model/document-chunk.model';

export abstract class IDocumentChunkRepositoryPort {
  abstract saveMany(documentChunks: DocumentChunk[]): Promise<DocumentChunk[]>;
}
