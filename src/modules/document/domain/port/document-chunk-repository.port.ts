import { DocumentChunk } from '../model/document-chunk.model';

export abstract class IDocumentChunkRepositoryPort {
  abstract saveMany(documentChunks: DocumentChunk[]): Promise<DocumentChunk[]>;
  abstract findByDocumentId(documentId: string): Promise<DocumentChunk[]>;
  abstract findSimilarChunks(
    embedding: number[], 
    limit?: number,
    documentId?: string
  ): Promise<DocumentChunk[]>;
  abstract deleteByDocumentId(documentId: string): Promise<void>;
}
