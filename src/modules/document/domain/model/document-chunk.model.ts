export class DocumentChunk {
  id?: string;
  content: string;
  embedding: number[]; // Store as number array in domain
  chunkNumber: number;
  createdAt?: Date;
  documentId: string; // Link to the parent document

  constructor(
    content: string,
    embedding: number[],
    chunkNumber: number,
    documentId: string,
    id?: string,
    createdAt?: Date,
  ) {
    this.id = id;
    this.content = content;
    this.embedding = embedding;
    this.chunkNumber = chunkNumber;
    this.createdAt = createdAt;
    this.documentId = documentId;
  }
}
