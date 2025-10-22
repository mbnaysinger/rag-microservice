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
  private readonly SIMILARITY_THRESHOLD = 0.6; // Minimum similarity score to consider relevant

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
    // Search for more candidates to ensure we have enough results after filtering
    const similarChunks = await this.documentChunkRepository.findSimilarChunks(
      queryEmbedding,
      limit * 2, // Search for more candidates
      documentId
    );

    // 3. Filter results by similarity threshold and return only relevant results
    const filteredResults = similarChunks
      .map(chunk => ({
        chunk,
        score: (chunk as any).score || 0 // Score is added by MongoDB $vectorSearch
      }))
      .filter(result => result.score >= this.SIMILARITY_THRESHOLD)
      .slice(0, limit); // Limit to requested number of results

    return filteredResults;
  }

  async searchByDocumentId(documentId: string): Promise<DocumentChunk[]> {
    return this.documentChunkRepository.findByDocumentId(documentId);
  }

  async deleteDocumentChunks(documentId: string): Promise<void> {
    await this.documentChunkRepository.deleteByDocumentId(documentId);
  }
}