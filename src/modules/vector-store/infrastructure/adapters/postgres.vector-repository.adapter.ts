import { Client } from 'pg';
import 'pgvector/pg';
import {
  IVectorRepository,
  SimilaritySearchResult,
} from '../../domain/ports/vector-repository.port';
import { VectorDocument } from '../../domain/models/vector-document.model';
import { Injectable, Logger } from '@nestjs/common';

// This adapter provides a concrete implementation of the IVectorRepository
// port for a PostgreSQL database with the pgvector extension.
@Injectable()
export class PostgresVectorRepository implements IVectorRepository {
  private readonly client: Client;
  private readonly logger = new Logger(PostgresVectorRepository.name);

  // The constructor receives the database connection configuration.
  // In a real NestJS application, this would be injected via ConfigService.
  constructor(dbConfig: any) {
    this.client = new Client(dbConfig);
  }

  async setupInfrastructure(): Promise<void> {
    this.logger.log('Setting up Postgres infrastructure...');
    await this.client.connect();
    await this.client.query('CREATE EXTENSION IF NOT EXISTS vector');
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY,
        content TEXT,
        metadata JSONB,
        embedding VECTOR(3072)
      )
    `);
    // Using HNSW index for better performance, as suggested in start.txt
    await this.client.query(`
      CREATE INDEX IF NOT EXISTS ON documents
      USING hnsw (embedding vector_l2_ops)
    `);
    this.logger.log('Postgres infrastructure ready.');
  }

  async save(document: VectorDocument): Promise<void> {
    this.logger.log(`Saving document with id: ${document.id}`);
    const query = `
      INSERT INTO documents (id, content, metadata, embedding)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE
      SET content = EXCLUDED.content,
          metadata = EXCLUDED.metadata,
          embedding = EXCLUDED.embedding
    `;
    // The 'pgvector/pg' import automatically handles the conversion
    // of the JavaScript array to the PGvector format.
    await this.client.query(query, [
      document.id,
      document.content,
      document.metadata,
      document.embedding,
    ]);
  }

  async similaritySearch(
    embedding: number[],
    topK: number,
  ): Promise<SimilaritySearchResult[]> {
    this.logger.log(`Performing similarity search for top ${topK} results.`);
    const query = `
      SELECT
        id,
        content,
        metadata,
        1 - (embedding <=> $1) AS similarity_score
      FROM documents
      ORDER BY embedding <=> $1
      LIMIT $2
    `;
    const result = await this.client.query(query, [embedding, topK]);

    return result.rows.map((row) => ({
      document: new VectorDocument(
        row.content,
        row.metadata,
        [], // Avoid returning the full embedding
        row.id,
      ),
      score: row.similarity_score,
    }));
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }
}
