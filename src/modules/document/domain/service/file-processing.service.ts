import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { IFileProcessingPort } from '../port/file-processing.port';
import { Express } from 'express';

@Injectable()
export class FileProcessingService implements IFileProcessingPort {
  private readonly logger = new Logger(FileProcessingService.name);

  private readonly textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  async processFile(
    file: Express.Multer.File,
    documentId: string,
  ): Promise<string[]> {
    this.logger.log(
      `Processing file: ${file.originalname} (${file.mimetype}) for document ${documentId}`,
    );

    let text: string;

    switch (file.mimetype) {
      case 'application/pdf':
        text = await this.extractTextFromPdf(file.buffer);
        break;
      case 'text/plain':
        text = file.buffer.toString('utf-8');
        break;
      default:
        this.logger.warn(`Unsupported file type: ${file.mimetype}`);
        throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    if (!text) {
      this.logger.warn('No text extracted from file.');
      return [];
    }

    const chunks = await this.chunkText(text);
    this.logger.log(`File chunked into ${chunks.length} pieces.`);
    return chunks;
  }

  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      this.logger.error('Failed to extract text from PDF', error);
      throw new Error('Failed to extract text from PDF.');
    }
  }

  private async chunkText(text: string): Promise<string[]> {
    return this.textSplitter.splitText(text);
  }
}
