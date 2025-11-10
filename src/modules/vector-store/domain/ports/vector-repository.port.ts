import { VectorDocument } from '../models/vector-document.model';

export interface SimilaritySearchResult {
  document: VectorDocument;
  score: number;
}

export const VECTOR_REPOSITORY = 'VECTOR_REPOSITORY';

export interface IVectorRepository {
  setupInfrastructure(): Promise<void>;

  save(document: VectorDocument): Promise<void>;

  similaritySearch(
    embedding: number[],
    topK: number,
  ): Promise<SimilaritySearchResult[]>;
}
