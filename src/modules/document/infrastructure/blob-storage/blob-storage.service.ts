import { Injectable, Logger } from '@nestjs/common';
import { ConfigServerService } from '@modules/config/config.service';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';

import { IDocumentStoragePort } from '../../domain/port/document-storage.port';

@Injectable()
export class BlobStorageService implements IDocumentStoragePort {
  private readonly logger = new Logger(BlobStorageService.name);
  private readonly containerName: string;
  private readonly blobServiceClient: BlobServiceClient;

  constructor(private readonly configService: ConfigServerService) {
    const connectionString = this.configService.get(
      'config.blobstorage.connection-string',
    );
    this.containerName = this.configService.get('config.blobstorage.container');

    if (!connectionString || !this.containerName) {
      throw new Error('Azure Blob Storage configuration is missing.');
    }

    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  private getBlockBlobClient(blobName: string): BlockBlobClient {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    return containerClient.getBlockBlobClient(blobName);
  }

  async uploadFile(
    file: Express.Multer.File,
    blobName: string,
  ): Promise<string> {
    try {
      const blockBlobClient = this.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(file.buffer);
      this.logger.log(`File ${blobName} uploaded to Azure Blob Storage.`);
      return blockBlobClient.url;
    } catch (error) {
      this.logger.error(
        `Error uploading file to Azure Blob Storage: ${error.message}`,
      );
      throw new Error('Failed to upload file to Azure Blob Storage.');
    }
  }
}
