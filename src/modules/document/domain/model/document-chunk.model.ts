export class DocumentChunk {
  id?: string;
  content: string;
  embedding: number[]; // Store as number array in domain
  originalDocumentUrl: string;
  chunkNumber: number;
  createdAt?: Date;

  constructor(content: string, embedding: number[], originalDocumentUrl: string, chunkNumber: number, id?: string, createdAt?: Date) {
    this.id = id;
    this.content = content;
    this.embedding = embedding;
    this.originalDocumentUrl = originalDocumentUrl;
    this.chunkNumber = chunkNumber;
    this.createdAt = createdAt;
  }
}
