import { Injectable, OnModuleInit } from '@nestjs/common';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { ConfigServerService } from '@modules/config/config.service';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private client: OpenAIClient;
  private deploymentId: string;

  constructor(private configService: ConfigServerService) {}

  onModuleInit() {
    const endpoint = this.configService.get('azure.openAi.endpoint');
    const apiKey = this.configService.get('azure.openAi.apiKey');
    this.deploymentId = this.configService.get(
      'azure.openAi.deploymentId',
      'text-embedding-3-large', // Default model
    );

    if (!endpoint || !apiKey) {
      throw new Error(
        'Azure OpenAI endpoint or API key is not configured.',
      );
    }

    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  }

  /**
   * Creates a vector embedding for the given text.
   * @param text The text to create an embedding for.
   * @returns A promise that resolves to an array of numbers representing the embedding.
   */
  async createEmbedding(text: string): Promise<number[]> {
    const result = await this.client.getEmbeddings(this.deploymentId, [text]);
    // Assuming we get one embedding back for the single text input
    return result.data[0]?.embedding || [];
  }
}
