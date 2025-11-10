# Contexto para Assistente de Código Gemini

## Visão Geral do Projeto

Este projeto é um microsserviço em NestJS que atua como um **Gateway de Banco de Dados Vetorial**. Ele foi construído seguindo uma rigorosa **Arquitetura Hexagonal (Ports & Adapters)** para garantir alta coesão, baixo acoplamento e a capacidade de trocar a tecnologia de banco de dados subjacente de forma "plug-and-play".

Sua função principal é ingerir documentos de texto, processá-los em chunks, gerar embeddings vetoriais e persisti-los em um banco de dados vetorial configurado. Ele também expõe uma API para realizar buscas de similaridade semântica.

## Tecnologias Principais

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Arquitetura**: Hexagonal (Ports & Adapters)
- **Banco de Dados Vetorial (Atual)**: PostgreSQL com a extensão `pgvector`.
- **Banco de Dados Vetorial (Futuros)**: MongoDB, MySQL, MariaDB (arquitetado para suportá-los).
- **Serviços de IA**: Azure OpenAI (para geração de Embeddings).
- **Chunking de Documentos**: LangChain (`PDFLoader`, `TextLoader`, `RecursiveCharacterTextSplitter`).
- **Logging**: Pino (para logs estruturados em JSON).

---

## Estado Atual: MVP Funcional com Adapter Postgres

A implementação atual é um MVP (Minimum Viable Product) totalmente funcional que utiliza o PostgreSQL como banco de dados vetorial.

### Funcionalidades Implementadas

- **Endpoint de Ingestão**: `POST /api/v1/vector-store/documents/upload` para upload de arquivos `.pdf` e `.txt`.
- **Endpoint de Busca**: `POST /api/v1/vector-store/search` para realizar buscas de similaridade.

- **Pipeline de Ingestão**:
  1.  O arquivo é recebido pelo `VectorStoreController`.
  2.  O `DocumentLoaderService` (wrapper do LangChain) carrega o arquivo e o divide em "chunks".
  3.  Para cada chunk, o `EmbeddingService` gera um vetor via Azure OpenAI (`text-embedding-3-large`).
  4.  O `VectorDocumentService` (orquestrador) chama a porta `IVectorRepository` para salvar cada chunk e seu vetor.
  5.  O `PostgresVectorRepository` (adapter) implementa a lógica de persistência no PostgreSQL.

- **Pipeline de Busca**:
  1.  A query é recebida pelo `VectorStoreController`.
  2.  O `EmbeddingService` gera o vetor para a query.
  3.  O `VectorDocumentService` chama a porta `IVectorRepository` com o vetor da query.
  4.  O `PostgresVectorRepository` executa a busca de similaridade de cosseno (`<=>`) no banco.

### Arquitetura Atual (`VectorStoreModule`)

O código é organizado em uma estrutura hexagonal clara dentro do `src/modules/vector-store/`:

- **`1-api/` (Camada de Framework)**:
  - `vector-store.controller.ts`: Expõe os endpoints REST.
  - `dtos/`: Define os objetos de transferência de dados (`CreateDocumentDto`, `SimilaritySearchDto`) com validações.
  - `converters/`: Mapeia DTOs para modelos de domínio.

- **`2-domain/` (Camada de Domínio/Aplicação)**:
  - `models/`: Contém o modelo de negócio puro (`VectorDocument`).
  - `services/`: Contém a lógica de aplicação (`VectorDocumentService`, `EmbeddingService`, `DocumentLoaderService`).
  - `ports/`: Define a interface `IVectorRepository`, o "contrato" para a camada de infraestrutura.

- **`3-infrastructure/` (Camada de Adapters)**:
  - `adapters/`: Contém a implementação concreta da porta (`PostgresVectorRepository.adapter.ts`).

- **`vector-store.module.ts`**:
  - Utiliza um **provider de fábrica** para injetar a implementação correta do `IVectorRepository` com base na configuração do ambiente (`DATABASE_ADAPTER`), tornando o sistema plugável.

---

## Próximos Passos

1.  **Testes E2E**: Validar o fluxo completo de ingestão e busca.
2.  **Implementar Novos Adapters**:
    - Criar `MongoVectorRepository` para suportar MongoDB com Vector Search.
    - Implementar adapters para MySQL e MariaDB.
3.  **Logging e Observabilidade**: Validar os logs JSON gerados pelo Pino e integrá-los a uma plataforma como Grafana Loki.
4.  **Setup do Ambiente**: Detalhar as variáveis de ambiente necessárias no `README.md` para facilitar o setup de desenvolvimento.