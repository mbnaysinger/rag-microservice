import { Injectable, Logger } from '@nestjs/common';
import { ConfigServerService } from '@modules/config/config.service';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: OpenAIClient;
  private readonly deploymentName: string;

  constructor(private readonly configService: ConfigServerService) {
    const endpoint = this.configService.get('config.openai.endpoint');
    const apiKey = this.configService.get('config.openai.api_key');
    // Assumindo que o nome do seu "deployment" no Azure AI Studio é este.
    // Se for diferente, você pode adicionar uma chave ao .env.yml para ele.
    this.deploymentName = 'text-embedding-ada-002';

    if (!endpoint || !apiKey) {
      throw new Error('Azure OpenAI configuration is missing.');
    }

    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  }

  async createEmbeddings(chunks: string[]): Promise<number[][]> {
    if (!chunks || chunks.length === 0) {
      return [];
    }

    try {
      this.logger.log(`Requesting embeddings for ${chunks.length} chunks...`);
      const result = await this.client.getEmbeddings(this.deploymentName, chunks);
      this.logger.log('Embeddings received successfully.');

      // Ordena os embeddings para garantir que correspondam à ordem dos chunks originais
      const sortedEmbeddings = result.data.sort((a, b) => a.index - b.index);
      
      return sortedEmbeddings.map((data) => data.embedding);
    } catch (error) {
      this.logger.error(`Failed to create embeddings: ${error.message}`);
      throw new Error('Failed to create embeddings.');
    }
  }
}
