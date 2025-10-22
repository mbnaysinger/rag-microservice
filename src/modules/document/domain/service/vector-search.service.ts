import { Injectable } from '@nestjs/common';
import { IDocumentChunkRepositoryPort } from '../port/document-chunk-repository.port';
import { IEmbeddingPort } from '../port/embedding.port';
import { DocumentChunk } from '../model/document-chunk.model';

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

@Injectable()
export class VectorSearchService {
  constructor(
    private readonly documentChunkRepository: IDocumentChunkRepositoryPort,
    private readonly embeddingService: IEmbeddingPort,
  ) {}

  async searchSimilarContent(
    query: string,
    limit: number = 10,
    documentId?: string
  ): Promise<SearchResult[]> {
    // 1. Generate embedding for the search query
    const queryEmbeddings = await this.embeddingService.createEmbeddings([query]);
    const queryEmbedding = queryEmbeddings[0];

    // 2. Perform vector search using MongoDB Atlas Search
    const similarChunks = await this.documentChunkRepository.findSimilarChunks(
      queryEmbedding,
      limit,
      documentId
    );

    // 3. Return results with scores (scores are added by the repository)
    return similarChunks.map(chunk => ({
      chunk,
      score: (chunk as any).score || 0 // Score is added by MongoDB $vectorSearch
    }));
  }

  async searchByDocumentId(documentId: string): Promise<DocumentChunk[]> {
    return this.documentChunkRepository.findByDocumentId(documentId);
  }

  async deleteDocumentChunks(documentId: string): Promise<void> {
    await this.documentChunkRepository.deleteByDocumentId(documentId);
  }
}