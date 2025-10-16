# Testes do Módulo Portal

## AI Controller E2E Tests

Este diretório contém testes end-to-end para o controlador de IA do módulo Portal.

### Arquivo: `ai.controller.e2e-spec.ts`

Testa o endpoint `POST /api/v1/ai/generate` com diferentes tipos de conteúdo:

#### Cenários de Sucesso Testados:
- ✅ Conteúdo simples ("oi")
- ✅ Pergunta complexa
- ✅ Conteúdo com caracteres especiais
- ✅ Conteúdo multilinha
- ✅ Conteúdo em formato JSON
- ✅ Código de programação
- ✅ Conteúdo longo
- ✅ Emojis e caracteres Unicode
- ✅ Requisição com modelConfigId opcional

#### Cenários de Validação Testados:
- ❌ ProductId ausente
- ❌ ServiceName ausente
- ❌ Content ausente
- ❌ ProductId com formato inválido
- ❌ Content vazio

### Como Executar

```bash
# Executar apenas os testes do AI Controller
npm run test:e2e -- test/modules/portal/ai.controller.e2e-spec.ts

# Executar todos os testes e2e
npm run test:e2e

# Executar com coverage
npm run test:cov
```

### Estrutura do Payload de Teste

```json
{
  "productId": "68643a99620d8ff4cdaaa992",
  "serviceName": "chat-service",
  "content": "conteúdo variável para teste",
  "modelConfigId": "507f1f77bcf86cd799439012" // opcional
}
```

### Resposta Esperada

```json
{
  "generatedText": "Resposta gerada pela IA",
  "productId": "68643a99620d8ff4cdaaa992",
  "model": "gpt-4",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 20,
    "totalTokens": 30
  },
  "finishReason": "stop"
}
```