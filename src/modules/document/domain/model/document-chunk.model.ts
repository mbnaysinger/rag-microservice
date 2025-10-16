export class DocumentChunk {
  id?: string;
  content: string;
  embedding: number[]; // Store as number array in domain
  originalDocumentName: string;
  originalDocumentUrl: string;
  chunkNumber: number;
  createdAt?: Date;

  constructor(
    content: string,
    embedding: number[],
    originalDocumentName: string,
    originalDocumentUrl: string,
    chunkNumber: number,
    id?: string,
    createdAt?: Date,
  ) {
    this.id = id;
    this.content = content;
    this.embedding = embedding;
    this.originalDocumentName = originalDocumentName;
    this.originalDocumentUrl = originalDocumentUrl;
    this.chunkNumber = chunkNumber;
    this.createdAt = createdAt;
  }
}
