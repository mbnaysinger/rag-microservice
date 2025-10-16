import { Injectable, Logger } from '@nestjs/common';
import { ConfigServerService } from '@modules/config/config.service';
import { AzureOpenAI } from 'openai';
import { IEmbeddingPort } from '../../domain/port/embedding.port';

@Injectable()
export class EmbeddingService implements IEmbeddingPort {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: AzureOpenAI;
  private readonly deploymentName: string;
  private readonly apiVersion: string;

  constructor(private readonly configService: ConfigServerService) {
    const embeddingEndpoint = this.configService.get('config.openai-embedding.endpoint');
    const embeddingApiKey = this.configService.get('config.openai-embedding.api_key');
    const deploymentName = this.configService.get('config.openai-embedding.deployment-name');
    const apiVersion = this.configService.get('config.openai-embedding.api_version');

    this.deploymentName = deploymentName;
    this.apiVersion = apiVersion;

    if (!embeddingEndpoint || !embeddingApiKey || !this.apiVersion || !this.deploymentName) {
      throw new Error('Azure OpenAI Embedding configuration is missing.');
    }

    // Ensure the endpoint is just the base URL without path or query parameters
    const url = new URL(embeddingEndpoint);
    const baseEndpoint = `https://${url.hostname}`;

    this.client = new AzureOpenAI({
      apiKey: embeddingApiKey,
      endpoint: baseEndpoint,
      apiVersion: this.apiVersion,
    });
  }

  async createEmbeddings(chunks: string[]): Promise<number[][]> {
    if (!chunks || chunks.length === 0) {
      return [];
    }

    try {
      this.logger.log(`Requesting embeddings for ${chunks.length} chunks...`);
      const result = await this.client.embeddings.create({
        model: this.deploymentName,
        input: chunks,
      });
      this.logger.log('Embeddings received successfully.');

      // A API de embeddings do OpenAI já retorna os dados ordenados por índice.
      return result.data.map((data) => data.embedding);
    } catch (error) {
      this.logger.error(`Failed to create embeddings:`, error);
      throw new Error('Failed to create embeddings.');
    }
  }
}
