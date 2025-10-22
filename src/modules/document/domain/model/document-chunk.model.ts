export class DocumentChunk {
  id?: string;
  content: string;
  embedding: number[]; // Store as number array in domain
  chunkNumber: number;
  createdAt?: Date;
  documentId: string; // Link to the parent document
  score?: number; // Vector search similarity score

  constructor(
    content: string,
    embedding: number[],
    chunkNumber: number,
    documentId: string,
    id?: string,
    createdAt?: Date,
    score?: number,
  ) {
    this.id = id;
    this.content = content;
    this.embedding = embedding;
    this.chunkNumber = chunkNumber;
    this.createdAt = createdAt;
    this.documentId = documentId;
    this.score = score;
  }
}
