import { Module, Logger } from '@nestjs/common';
import { ConfigServerService } from '@shared/config/config.service';
import { ConfigServerModule } from '@shared/config/config.module';
import { VECTOR_REPOSITORY } from './domain/ports/vector-repository.port';
import { PostgresVectorRepository } from './infrastructure/adapters/postgres.vector-repository.adapter';
import { VectorDocumentService } from './domain/services/vector-document.service';
import { EmbeddingService } from './domain/services/embedding.service';
import { DocumentLoaderService } from './domain/services/document-loader.service';
import { VectorStoreConverter } from './api/converters/vector-store.converter';
import { VectorStoreController } from './api/vector-store.controller';

const vectorRepositoryFactory = {
  provide: VECTOR_REPOSITORY,
  useFactory: (configService: ConfigServerService) => {
    const adapter = configService.get('database.adapter');
    const logger = new Logger('VectorRepositoryFactory');

    logger.log(`Database adapter selected: ${adapter}`);

    switch (adapter) {
      case 'postgres':
        const pgConfig = configService.get('database.postgres');
        if (!pgConfig) {
          throw new Error('Postgres configuration not found.');
        }
        return new PostgresVectorRepository(pgConfig);
      // case 'mongo':
      //   return new MongoVectorRepository(...);
      default:
        throw new Error(`Unsupported database adapter: ${adapter}`);
    }
  },
  inject: [ConfigServerService],
};

@Module({
  imports: [ConfigServerModule],
  controllers: [VectorStoreController],
  providers: [
    vectorRepositoryFactory,
    VectorDocumentService,
    EmbeddingService,
    DocumentLoaderService,
    VectorStoreConverter,
  ],
  exports: [VectorDocumentService], // Export the main service for controllers
})
export class VectorStoreModule {}
