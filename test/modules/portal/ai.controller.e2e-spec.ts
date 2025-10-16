import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AIController } from '../../../src/modules/portal/api/v1/rest/ai.controller';
import { AIAsAService } from '../../../src/modules/portal/domain/service/ai-as-a-service.service';
import { AIGenerationCreateDto } from '../../../src/modules/portal/api/v1/dto/ai-generation-create.dto';
import { AIGenerationResponseDto } from '../../../src/modules/portal/api/v1/dto/ai-generation-response.dto';

describe('AIController (e2e)', () => {
  let app: INestApplication;
  let aiAsAService: jest.Mocked<AIAsAService>;

  const mockResponse: AIGenerationResponseDto = {
    generatedText: 'Resposta gerada pela IA',
    productId: '68643a99620d8ff4cdaaa992',
    model: 'gpt-4',
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
    finishReason: 'stop',
  };

  beforeEach(async () => {
    const mockAIAsAService = {
      generate: jest.fn().mockResolvedValue(mockResponse),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [
        {
          provide: AIAsAService,
          useValue: mockAIAsAService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    aiAsAService = moduleFixture.get(AIAsAService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/ai/generate', () => {
    const basePayload = {
      productId: '68643a99620d8ff4cdaaa992',
      serviceName: 'chat-service',
    };

    it('deve gerar texto com sucesso para conteúdo simples', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content: 'oi',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso para pergunta complexa', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content:
          'Explique o conceito de inteligência artificial e suas aplicações práticas no mundo moderno',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso para conteúdo com caracteres especiais', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content:
          'Como resolver: 2 + 2 = ? E também: α + β = γ (símbolos gregos)',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso para conteúdo multilinha', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content: `Primeira linha da pergunta
Segunda linha com mais detalhes
Terceira linha com conclusão`,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso para conteúdo em JSON', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content:
          'Analise este JSON: {"nome": "João", "idade": 30, "ativo": true}',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso para código de programação', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content:
          'Explique este código: function hello() { console.log("Hello World!"); }',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso para conteúdo longo', async () => {
      const longContent =
        'Esta é uma pergunta muito longa que simula um cenário real onde o usuário pode enviar textos extensos. '.repeat(
          10,
        );
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content: longContent,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso para emojis e caracteres Unicode', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content:
          'Como você está hoje? 😊🚀 Fale sobre tecnologia 💻 e inovação 🔬',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    it('deve gerar texto com sucesso incluindo modelConfigId opcional', async () => {
      const payload: AIGenerationCreateDto = {
        ...basePayload,
        content: 'Teste com configuração específica',
        modelConfigId: '507f1f77bcf86cd799439012',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(aiAsAService.generate).toHaveBeenCalledWith(payload);
    });

    // Testes de validação
    it('deve retornar erro 400 quando productId está ausente', async () => {
      const payload = {
        serviceName: 'chat-service',
        content: 'teste',
      };

      await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(400);
    });

    it('deve retornar erro 400 quando serviceName está ausente', async () => {
      const payload = {
        productId: '68643a99620d8ff4cdaaa992',
        content: 'teste',
      };

      await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(400);
    });

    it('deve retornar erro 400 quando content está ausente', async () => {
      const payload = {
        productId: '68643a99620d8ff4cdaaa992',
        serviceName: 'chat-service',
      };

      await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(400);
    });

    it('deve retornar erro 400 quando productId tem formato inválido', async () => {
      const payload = {
        productId: 'invalid-id',
        serviceName: 'chat-service',
        content: 'teste',
      };

      await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(400);
    });

    it('deve retornar erro 400 quando content está vazio', async () => {
      const payload = {
        productId: '68643a99620d8ff4cdaaa992',
        serviceName: 'chat-service',
        content: '',
      };

      await request(app.getHttpServer())
        .post('/api/v1/ai/generate')
        .send(payload)
        .expect(400);
    });
  });
});
