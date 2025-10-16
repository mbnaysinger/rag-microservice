export abstract class IFileProcessingPort {
  abstract processFile(file: Express.Multer.File): Promise<string[]>;
}
