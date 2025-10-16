# Contexto para Assistente de Código Gemini

## Visão Geral do Projeto

Este projeto é um microsserviço em NestJS que atua como um orquestrador de RAG (Retrieval-Augmented Generation). Sua função é ingerir, processar, vetorizar e armazenar documentos, preparando-os para consultas de similaridade e uso por sistemas de IA generativa.

## Tecnologias Principais

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL (v8+) com TypeORM
- **Armazenamento de Arquivos**: Azure Blob Storage
- **Serviços de IA**: Azure OpenAI (para Embeddings)
- **APIs Externas Futuras**: Microsoft Graph API (para SharePoint)

---

## Estado Atual: POC de Ingestão

A implementação atual é uma Prova de Conceito funcional do pipeline de ingestão.

### Funcionalidades

- **Endpoint**: `POST /api/v1/documents/upload` para upload de arquivos `.pdf` e `.txt`.
- **Pipeline de Orquestração**: 
  1.  O arquivo original é salvo no Azure Blob Storage.
  2.  O texto é extraído e dividido em "chunks" com `langchain`.
  3.  Os "chunks" são vetorizados via Azure OpenAI.
  4.  Os "chunks" e seus vetores são persistidos na tabela `document_chunks` do MySQL.

### Arquitetura Atual (`DocumentModule`)

- **`api/`**: Controllers para a camada de entrada (HTTP).
- **`domain/`**: Lógica de negócio principal, modelos de dados (entidades) e serviços de domínio.
- **`infrastructure/`**: Implementações de clientes para serviços externos (Azure Blob Storage, Azure OpenAI).

---

## Visão Futura e Roadmap (Baseado em `arq.md`)

O objetivo é evoluir a POC para um orquestrador completo e robusto.

### Próximas Funcionalidades

1.  **API de Consulta (Retrieval)**: 
    - Criar um endpoint (ex: `POST /api/v1/search`) que recebe uma query de texto.
    - Gera o embedding para a query.
    - Executa uma busca de similaridade de vetores no MySQL para retornar os `document_chunks` mais relevantes.

2.  **Múltiplos Gatilhos de Ingestão**:
    - **Webhook do Blob Storage**: Processar arquivos automaticamente quando forem adicionados ao container.
    - **Job Agendado para SharePoint**: Criar um serviço (`SharePointConnectorService`) que periodicamente busca por documentos novos ou atualizados no SharePoint via Microsoft Graph API.

3.  **Suporte a Mais Tipos de Arquivo**:
    - Evoluir o `FileProcessingService` para usar um padrão de design **Strategy** para suportar `DOCX`, planilhas (`XLSX`) e imagens (`OCR`).

4.  **Modelo de Dados Avançado**:
    - Introduzir uma tabela `documents` para metadados (nome do arquivo, status do processamento, versão).
    - Introduzir uma tabela `cost_logs` para rastrear o uso de tokens e o custo das operações de embedding (`CostTrackingService`).

5.  **Gerenciamento de Versão e Atualizações**:
    - Implementar a lógica para detectar documentos atualizados (ex: v2 de um arquivo no SharePoint).
    - O fluxo deve deletar os `chunks` antigos associados ao documento e reprocessar o novo arquivo do zero.

### Arquitetura Alvo

A arquitetura deve evoluir para serviços ainda mais granulares, como:
- `ProcessingOrchestratorService`: Para orquestrar os fluxos complexos.
- `VectorStoreService`: Para abstrair as interações com o banco de dados vetorial.

## Diretrizes de Desenvolvimento

- **Manter a Arquitetura**: Novas funcionalidades devem seguir o padrão modular e de separação de camadas (`api`, `domain`, `infrastructure`).
- **Configuração Centralizada**: Usar sempre o `.env.yml` e o `ConfigServerService` para gerenciar configurações.
- **Interação com o Banco**: Utilizar repositórios TypeORM. Abstrair consultas complexas de vetores dentro de um serviço apropriado (como o futuro `VectorStoreService`).
