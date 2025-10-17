export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileExtension: string;
  author?: string; // Optional, as it might not always be available
  creationDate?: Date; // Optional, as it might not always be available
  uploadDate: Date;
  storagePath: string; // URL or path in Azure Blob Storage
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  version: number; // For future versioning
}
