import { randomUUID } from 'crypto';

export class VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];

  constructor(
    content: string,
    metadata: Record<string, any>,
    embedding: number[],
    id?: string,
  ) {
    this.id = id || randomUUID();
    this.content = content;
    this.metadata = metadata;
    this.embedding = embedding;
  }
}
