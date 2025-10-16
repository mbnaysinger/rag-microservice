import { BadRequestException } from '@nestjs/common';
import { EmailValidationUtil } from '../../../../../src/modules/portal/domain/utils/email-validation.util';

describe('EmailValidationUtil', () => {
  describe('validateEmailAndExtractUserId', () => {
    it('deve extrair userId e validar domínio FIERGS corretamente', () => {
      const email = 'peterson.paloschi@fiergs.org.br';
      const result = EmailValidationUtil.validateEmailAndExtractUserId(email);

      expect(result.userId).toBe('peterson.paloschi');
      expect(result.isValid).toBe(true);
      expect(result.domain).toBe('fiergs.org.br');
    });

    it('deve extrair userId e validar domínio SENAI corretamente', () => {
      const email = 'joao.silva@SENAI.org.br';
      const result = EmailValidationUtil.validateEmailAndExtractUserId(email);

      expect(result.userId).toBe('joao.silva');
      expect(result.isValid).toBe(true);
      expect(result.domain).toBe('SENAI.org.br');
    });

    it('deve extrair userId e validar domínio SESI corretamente', () => {
      const email = 'Maria.Santos@sesi.org.br';
      const result = EmailValidationUtil.validateEmailAndExtractUserId(email);

      expect(result.userId).toBe('maria.santos');
      expect(result.isValid).toBe(true);
      expect(result.domain).toBe('sesi.org.br');
    });

    it('deve extrair userId e validar domínio CIERGS corretamente', () => {
      const email = 'teste@ciergs.org.br';
      const result = EmailValidationUtil.validateEmailAndExtractUserId(email);

      expect(result.userId).toBe('teste');
      expect(result.isValid).toBe(true);
      expect(result.domain).toBe('ciergs.org.br');
    });

    it('deve extrair userId e validar domínio IEL corretamente', () => {
      const email = 'usuario@iel.org.br';
      const result = EmailValidationUtil.validateEmailAndExtractUserId(email);

      expect(result.userId).toBe('usuario');
      expect(result.isValid).toBe(true);
      expect(result.domain).toBe('iel.org.br');
    });

    it('deve lançar exceção para e-mail inválido sem @', () => {
      expect(() => {
        EmailValidationUtil.validateEmailAndExtractUserId('emailinvalido');
      }).toThrow(BadRequestException);
    });

    it('deve lançar exceção para e-mail vazio', () => {
      expect(() => {
        EmailValidationUtil.validateEmailAndExtractUserId('');
      }).toThrow(BadRequestException);
    });

    it('deve lançar exceção para e-mail com @ mas sem domínio', () => {
      expect(() => {
        EmailValidationUtil.validateEmailAndExtractUserId('usuario@');
      }).toThrow(BadRequestException);
    });

    it('deve lançar exceção para e-mail com @ mas sem usuário', () => {
      expect(() => {
        EmailValidationUtil.validateEmailAndExtractUserId('@fiergs.org.br');
      }).toThrow(BadRequestException);
    });

    it('deve lançar exceção para domínio não permitido', () => {
      expect(() => {
        EmailValidationUtil.validateEmailAndExtractUserId('usuario@gmail.com');
      }).toThrow(BadRequestException);
    });

    it('deve lançar exceção para domínio corporativo não permitido', () => {
      expect(() => {
        EmailValidationUtil.validateEmailAndExtractUserId(
          'usuario@empresa.com.br',
        );
      }).toThrow(BadRequestException);
    });
  });

  describe('validateEmailsAndExtractUserIds', () => {
    it('deve processar lista de e-mails válidos', () => {
      const emails = [
        'peterson.paloschi@fiergs.org.br',
        'joao.silva@senai.org.br',
        'maria.santos@sesi.org.br',
      ];

      const result =
        EmailValidationUtil.validateEmailsAndExtractUserIds(emails);

      expect(result).toEqual([
        'peterson.paloschi',
        'joao.silva',
        'maria.santos',
      ]);
    });

    it('deve remover duplicatas mantendo ordem', () => {
      const emails = [
        'Peterson.Paloschi@fiergs.org.br',
        'peterson.paloschi@fiergs.org.br',
        'joao.silva@senai.org.br',
      ];

      const result =
        EmailValidationUtil.validateEmailsAndExtractUserIds(emails);

      expect(result).toEqual(['peterson.paloschi', 'joao.silva']);
    });

    it('deve retornar array vazio para lista vazia', () => {
      const result = EmailValidationUtil.validateEmailsAndExtractUserIds([]);
      expect(result).toEqual([]);
    });

    it('deve retornar array vazio para null', () => {
      const result = EmailValidationUtil.validateEmailsAndExtractUserIds(null);
      expect(result).toEqual([]);
    });

    it('deve lançar exceção se algum e-mail for inválido', () => {
      const emails = ['peterson.paloschi@fiergs.org.br', 'usuario@gmail.com'];

      expect(() => {
        EmailValidationUtil.validateEmailsAndExtractUserIds(emails);
      }).toThrow(BadRequestException);
    });
  });

  describe('hasUserAccess', () => {
    it('deve retornar true se usuário for o criador', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'peterson.paloschi',
        ['joao.silva', 'maria.santos'],
        'Peterson.Paloschi',
      );

      expect(result).toBe(true);
    });

    it('deve retornar true se usuário estiver na lista de permitidos (case-insensitive)', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'Peterson.Paloschi',
        ['peterson.paloschi', 'joao.silva'],
        'criador',
      );

      expect(result).toBe(true);
    });

    it('deve retornar false se usuário não for criador nem estiver na lista', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'usuario.teste',
        ['peterson.paloschi', 'joao.silva'],
        'criador',
      );

      expect(result).toBe(false);
    });

    it('deve retornar false para userId vazio', () => {
      const result = EmailValidationUtil.hasUserAccess(
        '',
        ['peterson.paloschi', 'joao.silva'],
        'criador',
      );

      expect(result).toBe(false);
    });

    it('deve retornar false para userId null', () => {
      const result = EmailValidationUtil.hasUserAccess(
        null,
        ['peterson.paloschi', 'joao.silva'],
        'criador',
      );

      expect(result).toBe(false);
    });

    it('deve lidar com lista de usuários permitidos vazia', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'peterson.paloschi',
        [],
        'Peterson.Paloschi',
      );

      expect(result).toBe(true); // É o criador
    });

    // Novos testes para strings vazias em allowedUsers
    it('deve retornar false quando allowedUsers contém apenas strings vazias', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'peterson.paloschi',
        ['', '  ', ''],
        'outro.criador',
      );

      expect(result).toBe(false);
    });

    it('deve retornar true para criador mesmo com allowedUsers contendo strings vazias', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'peterson.paloschi',
        ['', '  ', ''],
        'Peterson.Paloschi',
      );

      expect(result).toBe(true);
    });

    it('deve filtrar strings vazias e processar apenas usuários válidos', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'joao.silva',
        ['', 'joao.silva', '  ', 'maria.santos', ''],
        'peterson.paloschi',
      );

      expect(result).toBe(true);
    });

    it('deve retornar false quando não há usuários válidos na lista e não é o criador', () => {
      const result = EmailValidationUtil.hasUserAccess(
        'outro.usuario',
        ['', '  ', null, undefined],
        'peterson.paloschi',
      );

      expect(result).toBe(false);
    });

    it('deve tratar strings com espaços em branco corretamente', () => {
      const result = EmailValidationUtil.hasUserAccess(
        ' peterson.paloschi ',
        ['peterson.paloschi', 'joao.silva'],
        'criador',
      );

      expect(result).toBe(true);
    });
  });
});
