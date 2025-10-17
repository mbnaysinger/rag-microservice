import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableDocumentChunks1760661237593
  implements MigrationInterface
{
  name = 'CreateTableDocumentChunks1760661237593';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criação da Tabela 'document_chunks'
    await queryRunner.createTable(
      new Table({
        name: 'document_chunks',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'embedding',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'chunkNumber',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            // Coluna da Chave Estrangeira (Foreign Key)
            name: 'documentId',
            type: 'varchar',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_DOCUMENT_CHUNKS_DOCUMENT_ID',
            columnNames: ['documentId'],
          },
        ],
      }),
      true,
    );

    // 2. Criação da Chave Estrangeira
    await queryRunner.createForeignKey(
      'document_chunks',
      new TableForeignKey({
        columnNames: ['documentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'documents',
        onDelete: 'CASCADE', // Se o documento for deletado, os chunks também são.
        name: 'FK_document_chunks_documentId',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Exclui a Chave Estrangeira
    await queryRunner.dropForeignKey(
      'document_chunks',
      'FK_document_chunks_documentId',
    );

    // 2. Exclui a Tabela
    await queryRunner.dropTable('document_chunks');
  }
}
