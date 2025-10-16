import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { PromptService } from '../../../../../src/modules/portal/domain/service/prompt.service';
import { IPromptPort } from '../../../../../src/modules/portal/domain/port/prompt.port.interface';
import { PromptModel } from '../../../../../src/modules/portal/domain/model/prompt.model';
import {
  PromptVisibility,
  BusinessEntity,
} from '../../../../../src/modules/portal/domain/model/prompt-category.enum';
import { PromptAdapter } from '../../../../../src/modules/portal/infrastructure/repositories/prompt.repository';

describe('PromptService - Funcionalidades allowed_users', () => {
  let service: PromptService;
  let mockPromptPort: jest.Mocked<IPromptPort>;

  const mockPromptModel = PromptModel.builder()
    .withId('507f1f77bcf86cd799439011')
    .withTitle('Prompt de Teste')
    .withPromptText('Texto do prompt de teste')
    .withCreatorId('peterson.paloschi')
    .withCreatorDept('TI')
    .withCategoryId('507f1f77bcf86cd799439012')
    .withVisibility(PromptVisibility.PUBLIC)
    .withAllowedEntities([BusinessEntity.TODAS])
    .withAllowedUsers([])
    .withCreatedAt(new Date())
    .withUpdatedAt(new Date())
    .withCreatedBy('peterson.paloschi')
    .withUpdatedBy('peterson.paloschi')
    .build();

  beforeEach(async () => {
    const mockPortImplementation = {
      findAll: jest.fn(),
      findAllVisible: jest.fn(),
      findById: jest.fn(),
      findByCreatorId: jest.fn(),
      findByCategoryId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      incrementCounter: jest.fn(),
      isOwner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptService,
        {
          provide: PromptAdapter,
          useValue: mockPortImplementation,
        },
      ],
    }).compile();

    service = module.get<PromptService>(PromptService);
    mockPromptPort = module.get(PromptAdapter);
  });

  describe('create', () => {
    it('deve criar prompt público quando allowedUsers estiver vazio', async () => {
      const prompt = PromptModel.builder()
        .withTitle('Prompt Público')
        .withPromptText('Texto do prompt')
        .withCreatorId('peterson.paloschi')
        .withCreatorDept('TI')
        .withCategoryId('507f1f77bcf86cd799439012')
        .withVisibility(PromptVisibility.PUBLIC)
        .withAllowedUsers([])
        .build();

      mockPromptPort.save.mockResolvedValue(prompt);

      const result = await service.create(prompt);

      expect(mockPromptPort.save).toHaveBeenCalledWith(prompt);
      expect(result.getVisibility()).toBe(PromptVisibility.PUBLIC);
      expect(result.getAllowedUsers()).toEqual([]);
    });

    it('deve criar prompt privado com allowedUsers quando emails válidos forem fornecidos', async () => {
      const allowedEmails = [
        'peterson.paloschi@fiergs.org.br',
        'joao.silva@senai.org.br',
      ];

      const prompt = PromptModel.builder()
        .withTitle('Prompt Privado')
        .withPromptText('Texto do prompt')
        .withCreatorId('peterson.paloschi')
        .withCreatorDept('TI')
        .withCategoryId('507f1f77bcf86cd799439012')
        .withVisibility(PromptVisibility.PUBLIC)
        .withAllowedUsers(allowedEmails)
        .build();

      const expectedPrompt = PromptModel.builder()
        .withTitle('Prompt Privado')
        .withPromptText('Texto do prompt')
        .withCreatorId('peterson.paloschi')
        .withCreatorDept('TI')
        .withCategoryId('507f1f77bcf86cd799439012')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['peterson.paloschi', 'joao.silva'])
        .build();

      mockPromptPort.save.mockResolvedValue(expectedPrompt);

      const result = await service.create(prompt);

      expect(result.getVisibility()).toBe(PromptVisibility.PRIVATE);
      expect(result.getAllowedUsers()).toEqual([
        'peterson.paloschi',
        'joao.silva',
      ]);
    });

    it('deve lançar BadRequestException para emails com domínio inválido', async () => {
      const allowedEmails = [
        'peterson.paloschi@fiergs.org.br',
        'usuario@gmail.com',
      ];

      const prompt = PromptModel.builder()
        .withTitle('Prompt Privado')
        .withPromptText('Texto do prompt')
        .withCreatorId('peterson.paloschi')
        .withCreatorDept('TI')
        .withCategoryId('507f1f77bcf86cd799439012')
        .withVisibility(PromptVisibility.PUBLIC)
        .withAllowedUsers(allowedEmails)
        .build();

      await expect(service.create(prompt)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockPromptPort.findById.mockResolvedValue(mockPromptModel);
    });

    it('deve atualizar prompt para privado quando allowedUsers válidos forem fornecidos', async () => {
      const allowedEmails = ['joao.silva@senai.org.br'];
      const updateData = PromptModel.builder()
        .withTitle('Prompt Atualizado')
        .withPromptText('Texto atualizado')
        .withAllowedUsers(allowedEmails)
        .build();

      const updatedPrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Atualizado')
        .withPromptText('Texto atualizado')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['joao.silva'])
        .build();

      mockPromptPort.update.mockResolvedValue(updatedPrompt);

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateData,
        'peterson.paloschi',
      );

      expect(result.getVisibility()).toBe(PromptVisibility.PRIVATE);
      expect(result.getAllowedUsers()).toEqual(['joao.silva']);
    });

    it('deve atualizar prompt para público quando allowedUsers estiver vazio', async () => {
      const updateData = PromptModel.builder()
        .withTitle('Prompt Público Atualizado')
        .withPromptText('Texto atualizado')
        .withAllowedUsers([])
        .build();

      const updatedPrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Público Atualizado')
        .withPromptText('Texto atualizado')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PUBLIC)
        .withAllowedUsers([])
        .build();

      mockPromptPort.update.mockResolvedValue(updatedPrompt);

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateData,
        'peterson.paloschi',
      );

      expect(result.getVisibility()).toBe(PromptVisibility.PUBLIC);
      expect(result.getAllowedUsers()).toEqual([]);
    });

    it('deve lançar ForbiddenException quando usuário não for o criador', async () => {
      const updateData = PromptModel.builder()
        .withTitle('Tentativa de Atualização')
        .build();

      await expect(
        service.update('507f1f77bcf86cd799439011', updateData, 'outro.usuario'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException para emails inválidos na atualização', async () => {
      const updateData = PromptModel.builder()
        .withTitle('Prompt Atualizado')
        .withAllowedUsers(['usuario@gmail.com'])
        .build();

      await expect(
        service.update(
          '507f1f77bcf86cd799439011',
          updateData,
          'peterson.paloschi',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('não deve alterar visibilidade quando allowedUsers não for fornecido', async () => {
      const updateData = PromptModel.builder()
        .withTitle('Prompt Atualizado Sem AllowedUsers')
        .withPromptText('Texto atualizado')
        .build();

      // Simula que getAllowedUsers() retorna undefined quando não fornecido
      jest.spyOn(updateData, 'getAllowedUsers').mockReturnValue(undefined);

      const updatedPrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Atualizado Sem AllowedUsers')
        .withPromptText('Texto atualizado')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PUBLIC) // Mantém original
        .withAllowedUsers([]) // Mantém original
        .build();

      mockPromptPort.update.mockResolvedValue(updatedPrompt);

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updateData,
        'peterson.paloschi',
      );

      expect(result.getVisibility()).toBe(PromptVisibility.PUBLIC);
      expect(result.getAllowedUsers()).toEqual([]);
    });
  });

  describe('findById', () => {
    it('deve retornar prompt público sem verificação de acesso', async () => {
      const publicPrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Público')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PUBLIC)
        .withAllowedUsers([])
        .build();

      mockPromptPort.findById.mockResolvedValue(publicPrompt);

      const result = await service.findById(
        '507f1f77bcf86cd799439011',
        'outro.usuario',
      );

      expect(result).toBe(publicPrompt);
      expect(mockPromptPort.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('deve retornar prompt privado quando usuário for o criador', async () => {
      const privatePrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Privado')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['joao.silva'])
        .build();

      mockPromptPort.findById.mockResolvedValue(privatePrompt);

      const result = await service.findById(
        '507f1f77bcf86cd799439011',
        'peterson.paloschi',
      );

      expect(result).toBe(privatePrompt);
    });

    it('deve retornar prompt privado quando usuário estiver na lista de permitidos', async () => {
      const privatePrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Privado')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['joao.silva', 'maria.santos'])
        .build();

      mockPromptPort.findById.mockResolvedValue(privatePrompt);

      const result = await service.findById(
        '507f1f77bcf86cd799439011',
        'joao.silva',
      );

      expect(result).toBe(privatePrompt);
    });

    it('deve lançar ForbiddenException para prompt privado quando usuário não tiver acesso', async () => {
      const privatePrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Privado')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['joao.silva'])
        .build();

      mockPromptPort.findById.mockResolvedValue(privatePrompt);

      await expect(
        service.findById('507f1f77bcf86cd799439011', 'usuario.sem.acesso'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve retornar null quando prompt não existir', async () => {
      mockPromptPort.findById.mockResolvedValue(null);

      const result = await service.findById(
        '507f1f77bcf86cd799439099',
        'peterson.paloschi',
      );

      expect(result).toBeNull();
    });

    it('deve permitir acesso case-insensitive para usuários na lista', async () => {
      const privatePrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Privado')
        .withCreatorId('peterson.paloschi')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['joao.silva']) // lowercase
        .build();

      mockPromptPort.findById.mockResolvedValue(privatePrompt);

      const result = await service.findById(
        '507f1f77bcf86cd799439011',
        'Joao.Silva',
      ); // mixed case

      expect(result).toBe(privatePrompt);
    });

    it('deve lançar ForbiddenException quando prompt privado tem allowedUsers com strings vazias', async () => {
      const privatePrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Privado')
        .withCreatorId('daniel.chaves')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['', '  ', '']) // Strings vazias
        .build();

      mockPromptPort.findById.mockResolvedValue(privatePrompt);

      await expect(
        service.findById('507f1f77bcf86cd799439011', 'outro.usuario'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir acesso ao criador mesmo com allowedUsers contendo strings vazias', async () => {
      const privatePrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Privado')
        .withCreatorId('daniel.chaves')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['', '  ', '']) // Strings vazias
        .build();

      mockPromptPort.findById.mockResolvedValue(privatePrompt);

      const result = await service.findById(
        '507f1f77bcf86cd799439011',
        'daniel.chaves',
      );

      expect(result).toBe(privatePrompt);
    });

    it('deve lançar ForbiddenException quando userId não é fornecido para prompt privado', async () => {
      const privatePrompt = PromptModel.builder()
        .withId('507f1f77bcf86cd799439011')
        .withTitle('Prompt Privado')
        .withCreatorId('daniel.chaves')
        .withVisibility(PromptVisibility.PRIVATE)
        .withAllowedUsers(['joao.silva'])
        .build();

      mockPromptPort.findById.mockResolvedValue(privatePrompt);

      await expect(
        service.findById('507f1f77bcf86cd799439011'), // Sem userId
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
