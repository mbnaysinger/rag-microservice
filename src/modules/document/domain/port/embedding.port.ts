export abstract class IEmbeddingPort {
  abstract createEmbeddings(chunks: string[]): Promise<number[][]>;
}
