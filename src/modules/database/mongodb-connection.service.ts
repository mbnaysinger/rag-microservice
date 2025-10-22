import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { ConfigServerService } from '@modules/config/config.service';

@Injectable()
export class MongoDBConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoDBConnectionService.name);
  private client: MongoClient;
  private database: Db;

  constructor(private readonly configService: ConfigServerService) {}

  async onModuleInit(): Promise<void> {
    try {
      const uri = this.configService.get('config.db.uri');
      
      this.logger.log(`Connecting to MongoDB at: ${uri}`);
      
      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.database = this.client.db();
      
      this.logger.log('Successfully connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.logger.log('MongoDB connection closed');
    }
  }

  getDatabase(): Db {
    if (!this.database) {
      throw new Error('Database not initialized. Make sure the module is properly loaded.');
    }
    return this.database;
  }

  getCollection<T = any>(name: string): Collection<T> {
    return this.getDatabase().collection<T>(name);
  }

  async createIndexes(): Promise<void> {
    try {
      const db = this.getDatabase();
      
      // Create indexes for documents collection
      await db.collection('documents').createIndexes([
        { key: { fileName: 1, fileSize: 1 }, unique: true },
        { key: { processingStatus: 1 } },
        { key: { uploadDate: -1 } },
        { key: { createdAt: -1 } }
      ]);

      // Create indexes for document_chunks collection
      await db.collection('document_chunks').createIndexes([
        { key: { documentId: 1 } },
        { key: { chunkNumber: 1 } },
        { key: { createdAt: -1 } },
        { key: { documentId: 1, chunkNumber: 1 } }
      ]);

      // Create vector search index for embeddings
      // Note: This requires MongoDB Atlas or MongoDB 7.0+ with Atlas Search
      try {
        await db.collection('document_chunks').createSearchIndex({
          name: 'vector_index',
          definition: {
            mappings: {
              dynamic: false,
              fields: {
                embedding: {
                  type: 'knnVector',
                  dimensions: 3072, // Updated for newer embedding models
                  similarity: 'cosine'
                },
                documentId: {
                  type: 'string'
                }
              }
            }
          }
        });
        this.logger.log('Vector search index created successfully');
      } catch (error) {
        this.logger.warn('Vector search index creation failed (requires Atlas Search):', error.message);
      }

      this.logger.log('Database indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create database indexes', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.db('admin').command({ ping: 1 });
      return true;
    } catch (error) {
      this.logger.error('MongoDB health check failed', error);
      return false;
    }
  }
}