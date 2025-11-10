import { Inject, Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { DocumentLoaderService } from './document-loader.service';
import { EmbeddingService } from './embedding.service';
import {
  IVectorRepository,
  VECTOR_REPOSITORY,
  SimilaritySearchResult,
} from '../ports/vector-repository.port';
import { VectorDocument } from '../models/vector-document.model';

@Injectable()
export class VectorDocumentService {
  constructor(
    private readonly documentLoaderService: DocumentLoaderService,
    private readonly embeddingService: EmbeddingService,
    @Inject(VECTOR_REPOSITORY)
    private readonly vectorRepository: IVectorRepository,
  ) {}

  /**
   * Processes a file, splits it into chunks, generates embeddings,
   * and saves them to the vector store.
   * @param filePath The path to the file.
   * @param fileType The type of the file.
   * @param metadata Optional metadata to associate with the chunks.
   */
  async createFromFile(
    filePath: string,
    fileType: 'pdf' | 'txt',
    metadata: Record<string, any> = {},
  ): Promise<void> {
    const chunks = await this.documentLoaderService.loadAndSplit(
      filePath,
      fileType,
    );

    for (const chunk of chunks) {
      const embedding = await this.embeddingService.createEmbedding(
        chunk.pageContent,
      );

      const chunkMetadata = {
        ...metadata,
        ...chunk.metadata,
      };

      const vectorDocument = new VectorDocument(
        chunk.pageContent,
        chunkMetadata,
        embedding,
      );

      await this.vectorRepository.save(vectorDocument);
    }
  }

  /**
   * Finds documents similar to a given query.
   * @param query The query text.
   * @param topK The number of results to return.
   * @returns A list of similar documents and their scores.
   */
  async findSimilar(
    query: string,
    topK: number,
  ): Promise<SimilaritySearchResult[]> {
    const queryEmbedding = await this.embeddingService.createEmbedding(query);

    const results = await this.vectorRepository.similaritySearch(
      queryEmbedding,
      topK,
    );

    return results;
  }
}
