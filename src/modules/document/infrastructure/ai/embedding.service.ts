import { Injectable, Logger } from '@nestjs/common';
import { ConfigServerService } from '@modules/config/config.service';
import { AzureOpenAI } from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: AzureOpenAI;
  private readonly deploymentName: string;
  private readonly apiVersion: string;

  constructor(private readonly configService: ConfigServerService) {
    const embeddingEndpoint = this.configService.get('config.openai-embedding.endpoint');
    const embeddingApiKey = this.configService.get('config.openai-embedding.api_key');

    // Extract apiVersion from the embeddingEndpoint URL
    const url = new URL(embeddingEndpoint);
    const apiVersion = url.searchParams.get('api-version');

    // Extract deploymentName from the embeddingEndpoint URL path
    const pathSegments = url.pathname.split('/');
    const deploymentName = pathSegments[pathSegments.indexOf('deployments') + 1];

    this.deploymentName = deploymentName;
    this.apiVersion = apiVersion;

    if (!embeddingEndpoint || !embeddingApiKey || !this.apiVersion || !this.deploymentName) {
      throw new Error('Azure OpenAI Embedding configuration is missing.');
    }

    this.client = new AzureOpenAI({
      apiKey: embeddingApiKey,
      endpoint: `https://${url.hostname}`, // Base endpoint
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
      this.logger.error(`Failed to create embeddings: ${error.message}`);
      throw new Error('Failed to create embeddings.');
    }
  }
}
