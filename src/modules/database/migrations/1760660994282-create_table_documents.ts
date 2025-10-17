import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableDocuments1760660994282 implements MigrationInterface {
  name = 'CreateTableDocuments1760660994282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'fileName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'fileSize',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'fileExtension',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'author',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'creationDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'uploadDate',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'storagePath',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'processingStatus',
            type: 'enum',
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
            default: `'PENDING'`,
            isNullable: false,
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_DOCUMENT_ID',
            columnNames: ['id'],
          },
          {
            name: 'IDX_DOCUMENT_FILENAME',
            columnNames: ['fileName'],
          },
        ],
      }),
      true,
    );

    // Nota: A tabela 'document_chunks' e a chave estrangeira (foreign key)
    // que liga 'document_chunks' a 'documents' devem ser criadas separadamente,
    // pois o modelo da sua migration inicial só mostrava a criação de 'document_chunks'.
    // Para um schema completo, você precisaria criar 'document_chunks' e adicionar a FK aqui.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // A ordem de exclusão é importante: se 'document_chunks' tivesse a FK para 'documents',
    // 'document_chunks' deveria ser excluída primeiro.
    await queryRunner.dropTable('documents');
  }
}
