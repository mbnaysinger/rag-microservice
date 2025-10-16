import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AuthorizationService } from '../../../src/modules/auth/authorization.service';

describe('AuthorizationService - Case Insensitive UserIds', () => {
  let service: AuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationService],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  describe('validateUserAccess', () => {
    it('deve permitir acesso quando userIds são iguais em maiúsculas', () => {
      const requestingUser = { userId: 'CLAUDIA.SILVA', roles: [] };
      const targetUserId = 'CLAUDIA.SILVA';

      expect(() => {
        service.validateUserAccess(requestingUser, targetUserId);
      }).not.toThrow();
    });

    it('deve permitir acesso quando userIds são iguais ignorando case', () => {
      const requestingUser = { userId: 'CLAUDIA.SILVA', roles: [] };
      const targetUserId = 'claudia.silva';

      expect(() => {
        service.validateUserAccess(requestingUser, targetUserId);
      }).not.toThrow();
    });

    it('deve permitir acesso quando user é em minúsculas e target em maiúsculas', () => {
      const requestingUser = { userId: 'claudia.silva', roles: [] };
      const targetUserId = 'CLAUDIA.SILVA';

      expect(() => {
        service.validateUserAccess(requestingUser, targetUserId);
      }).not.toThrow();
    });

    it('deve permitir acesso quando userIds têm cases mistos', () => {
      const requestingUser = { userId: 'Claudia.Silva', roles: [] };
      const targetUserId = 'CLAUDIA.silva';

      expect(() => {
        service.validateUserAccess(requestingUser, targetUserId);
      }).not.toThrow();
    });

    it('deve negar acesso quando userIds são realmente diferentes', () => {
      const requestingUser = { userId: 'CLAUDIA.SILVA', roles: [] };
      const targetUserId = 'JOAO.SANTOS';

      expect(() => {
        service.executeWithAuthCheck(() => {
          service.validateUserAccess(requestingUser, targetUserId);
        });
      }).toThrow(ForbiddenException);
    });

    it('deve permitir acesso para admin independente do userId', () => {
      const adminUser = {
        userId: 'admin.user',
        roles: ['PIA_ADM[*]'],
      };
      const targetUserId = 'CLAUDIA.SILVA';

      expect(() => {
        service.validateUserAccess(adminUser, targetUserId);
      }).not.toThrow();
    });
  });

  describe('validateResourceOwnership', () => {
    it('deve permitir acesso quando criador e usuário são iguais ignorando case', () => {
      const requestingUser = { userId: 'CLAUDIA.SILVA', roles: [] };
      const resourceCreatedBy = 'claudia.silva';

      expect(() => {
        service.validateResourceOwnership(requestingUser, resourceCreatedBy);
      }).not.toThrow();
    });

    it('deve permitir acesso quando criador é em minúsculas e usuário em maiúsculas', () => {
      const requestingUser = { userId: 'claudia.silva', roles: [] };
      const resourceCreatedBy = 'CLAUDIA.SILVA';

      expect(() => {
        service.validateResourceOwnership(requestingUser, resourceCreatedBy);
      }).not.toThrow();
    });

    it('deve negar acesso quando criador e usuário são diferentes', () => {
      const requestingUser = { userId: 'CLAUDIA.SILVA', roles: [] };
      const resourceCreatedBy = 'JOAO.SANTOS';

      expect(() => {
        service.executeWithAuthCheck(() => {
          service.validateResourceOwnership(requestingUser, resourceCreatedBy);
        });
      }).toThrow(ForbiddenException);
    });

    it('deve permitir acesso para admin independente do criador', () => {
      const adminUser = {
        userId: 'admin.user',
        roles: ['PIA_ADM[*]'],
      };
      const resourceCreatedBy = 'CLAUDIA.SILVA';

      expect(() => {
        service.validateResourceOwnership(adminUser, resourceCreatedBy);
      }).not.toThrow();
    });
  });

  describe('isAdmin', () => {
    it('deve retornar true para usuário com role de admin', () => {
      const adminUser = { roles: ['PIA_ADM[*]'] };
      expect(service.isAdmin(adminUser)).toBe(true);
    });

    it('deve retornar false para usuário sem role de admin', () => {
      const regularUser = { roles: ['PIA_USER[*]'] };
      expect(service.isAdmin(regularUser)).toBe(false);
    });

    it('deve retornar false para usuário sem roles', () => {
      const userWithoutRoles = {};
      expect(service.isAdmin(userWithoutRoles)).toBe(false);
    });
  });
});
