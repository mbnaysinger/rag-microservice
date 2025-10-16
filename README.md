# Microsserviço Orquestrador de RAG

Este projeto é um microsserviço construído com NestJS, projetado para atuar como um orquestrador em um pipeline de RAG (Retrieval-Augmented Generation). Sua função principal é processar documentos, gerar embeddings e prepará-los para serem consumidos por sistemas de IA generativa.

## Prova de Conceito (POC) - Ingestão de Documentos

A implementação atual consiste em uma POC focada no pipeline de ingestão e processamento de documentos.

### Funcionalidades Implementadas

- **Endpoint de Upload**: Um endpoint `POST /api/v1/documents/upload` que aceita o upload de arquivos (`.pdf` e `.txt`).
- **Armazenamento de Originais**: O arquivo original enviado é persistido em um container do **Azure Blob Storage**.
- **Extração e Chunking**: O conteúdo de texto do arquivo é extraído e dividido em "chunks" (pedaços) de tamanho gerenciável, utilizando estratégias da biblioteca `langchain`.
- **Geração de Embeddings**: Os "chunks" de texto são enviados para a API do **Azure OpenAI** para gerar vetores de embedding para cada um.
- **Persistência Vetorial**: Os "chunks" de texto, juntamente com seus respectivos vetores (serializados como JSON), são salvos em um banco de dados **MySQL** para futuras consultas de similaridade.

### Arquitetura Adotada

Para a nova funcionalidade de documentos, foi adotada uma arquitetura modular e verticalizada, inspirada em princípios de design hexagonal e DDD (Domain-Driven Design), dentro do novo `DocumentModule`.

A estrutura de diretórios foi organizada da seguinte forma:

- `src/modules/document/`
  - `api/v1/`: Camada de API (Controllers). Responsável por receber as requisições HTTP e orquestrar o fluxo de trabalho.
  - `domain/`: Camada de Domínio. Contém a lógica de negócio principal e as estruturas de dados.
    - `model/`: As entidades do TypeORM (`DocumentChunkEntity`), que representam o núcleo do nosso domínio.
    - `service/`: Serviços de domínio (`FileProcessingService`, `DocumentStorageService`) que executam as regras de negócio, como o processamento de arquivos e a lógica de salvamento.
  - `infrastructure/`: Camada de Infraestrutura. Contém a implementação de clientes e adaptadores para tecnologias externas.
    - `blob-storage/`: Serviço para interagir com o Azure Blob Storage (`BlobStorageService`).
    - `ai/`: Serviço para interagir com a IA do Azure (`EmbeddingService`).

Essa abordagem promove a separação de responsabilidades, facilitando a manutenção e a substituição de tecnologias externas sem impactar a lógica de negócio principal.

## Cockpit (Guia de Execução)

Siga os passos abaixo para configurar e executar o projeto em um ambiente de desenvolvimento.

### Pré-requisitos

- Node.js (v18+)
- npm
- Acesso a um banco de dados MySQL (v8+)
- Conta no Azure com acesso ao Blob Storage e ao serviço OpenAI

### 1. Configuração

1.  Na raiz do projeto, crie ou edite o arquivo `.env.yml`.
2.  Adicione as configurações para os serviços externos, seguindo a estrutura abaixo:

    ```yaml
    server:
      port: 3000
    config:
      openai:
        endpoint: <SEU_ENDPOINT_AZURE_OPENAI>
        api_key: <SUA_API_KEY_AZURE_OPENAI>
      db:
        type: mysql
        host: <HOST_DO_SEU_DB>
        port: 3306
        username: <USUARIO_DO_DB>
        password: <SENHA_DO_DB>
        database: <NOME_DO_DB>
      blobstorage:
        connection-string: <SUA_CONNECTION_STRING_BLOB_STORAGE>
        container: <NOME_DO_CONTAINER>
      # ... outras configurações
    ```

### 2. Instalação

Execute o comando abaixo para instalar todas as dependências do projeto:

```bash
npm install
```
*Nota: Caso encontre erros de permissão (`EACCES`), pode ser necessário resolver as permissões do cache do npm ou instalar os pacotes `@azure/storage-blob`, `@azure/openai` e `langchain` manualmente.*

### 3. Setup do Banco de Dados

A aplicação utiliza TypeORM para gerenciar o banco de dados. Para criar a tabela `document_chunks` necessária para a POC:

1.  Abra o arquivo `src/modules/database/database.module.ts`.
2.  Altere a opção `synchronize` para `true`.
3.  Inicie a aplicação uma vez. O TypeORM criará a tabela automaticamente.
4.  **Importante**: Desfaça a alteração, retornando `synchronize` para `false`. Manter `synchronize: true` em produção é perigoso.

### 4. Executando a Aplicação

Para iniciar o microsserviço em modo de desenvolvimento com hot-reload:

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.

### 5. Testando

1.  Acesse a documentação do Swagger em `http://localhost:3000/api`.
2.  Localize a seção **Documents** e o endpoint `POST /api/v1/documents/upload`.
3.  Utilize a interface para enviar um arquivo (`.pdf` ou `.txt`).
4.  Verifique a resposta da API. Um status `201 Created` com o resumo do processamento indica sucesso.
5.  Consulte a tabela `document_chunks` no seu banco de dados para ver os dados persistidos.
