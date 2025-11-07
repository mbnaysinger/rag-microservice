# Project Roadmap: RAG Microservice

This document outlines the development tasks to evolve the RAG microservice from a POC to a robust, production-ready application.

## Phase 1: Foundation & Refactoring

-   [ ] **Task 1: Abstract Persistence Layer**
    -   [ ] Migrate from TypeORM to Prisma to better support multiple database backends (MySQL, PostgreSQL, MongoDB).
    -   [ ] Update repository implementations to use the new Prisma client.

-   [ ] **Task 2: Standardize Logging**
    -   [ ] Replace `nest-winston` with `pino` for high-performance, structured logging.
    -   [ ] Ensure all logs are in a JSON format suitable for log aggregators like Grafana Loki.

-   [ ] **Task 3: Create Retrieval API**
    -   [ ] Create a new endpoint `POST /api/v1/search`.
    -   [ ] The endpoint should accept a text query.
    -   [ ] It will generate an embedding for the query using Azure OpenAI.
    -   [ ] It will perform a vector similarity search in the database.
    -   [ ] It will return the most relevant `document_chunks`.

## Phase 2: Advanced Features & Production Readiness

-   [ ] **Task 4: Enhance Data Model**
    -   [ ] Create a `documents` table/collection to store file metadata (filename, status, version, etc.).
    -   [ ] Link `document_chunks` to the main `documents` entity.

-   [ ] **Task 5: Implement Document Versioning**
    -   [ ] Add logic to handle updates to existing documents.
    -   [ ] When a new version of a file is ingested, the old chunks should be deleted and the new ones created.

-   [ ] **Task 6: Expand Ingestion Triggers**
    -   [ ] Implement a webhook handler for Azure Blob Storage to trigger ingestion automatically.
    -   [ ] Create a scheduled job to poll a SharePoint location for new/updated files using Microsoft Graph API.

-   [ ] **Task 7: Support More File Types**
    -   [ ] Refactor `FileProcessingService` to use a Strategy pattern.
    -   [ ] Add strategies for parsing `.docx`, `.xlsx`, and images (with OCR).

-   [ ] **Task 8: Cost Tracking**
    -   [ ] Create a `cost_logs` table/collection.
    -   [ ] Implement a `CostTrackingService` to log token usage and costs associated with embedding generation.

## Phase 3: Documentation & Onboarding

-   [ ] **Task 9: Update README**
    -   [ ] Document the new architecture (Prisma, Pino).
    -   [ ] Add clear instructions for setting up the development environment.
    -   [ ] Provide detailed API documentation for all endpoints.
    -   [ ] Explain the project structure and conventions.
