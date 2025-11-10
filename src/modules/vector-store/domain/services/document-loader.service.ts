import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

@Injectable()
export class DocumentLoaderService {
  /**
   * Loads a document from a file path and splits it into chunks.
   * @param filePath The path to the file.
   * @param fileType The type of the file ('pdf' or 'txt').
   * @returns A promise that resolves to an array of Document chunks.
   */
  async loadAndSplit(
    filePath: string,
    fileType: 'pdf' | 'txt',
  ): Promise<Document[]> {
    const loader =
      fileType === 'pdf' ? new PDFLoader(filePath) : new TextLoader(filePath);

    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(rawDocs);
    return chunks;
  }
}
