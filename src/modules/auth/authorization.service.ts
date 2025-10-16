import { Injectable, ForbiddenException } from '@nestjs/common';
import { LoggerFactory } from '@modules/common/utils/logger.factory';

/**
 * Service para centralizar validações de autorização
 * Simples, direto e fácil de usar
 */
@Injectable()
export class AuthorizationService {
  private readonly logger = LoggerFactory.getLogger(AuthorizationService.name);

  /**
   * Verifica se usuário é admin
   */
  isAdmin(user: any): boolean {
    return (
      user?.roles?.some((role: string) => role.startsWith('PIA_ADM[*]')) ||
      false
    );
  }

  /**
   * Retorna as roles efetivas do usuário, aplicando a regra de fallback para PIA_USER
   * se nenhuma role específica for encontrada e o usuário não for ADMIN ou MANAGER.
   * @param user - Objeto do usuário
   * @returns Array de strings com as roles efetivas
   */
  getEffectiveUserRoles(user: any): string[] {
    const userRoles = user?.roles || [];
    const isTrulyAdmin = userRoles.some((role: string) =>
      role.startsWith('PIA_ADM[*]'),
    );
    const isManager = userRoles.some((role: string) =>
      role.startsWith('PIA_MANAGER[*]'),
    );

    if (isTrulyAdmin || isManager) {
      return userRoles; // Administradores e Gerentes mantêm suas roles existentes
    }

    const hasSpecificUserRole = userRoles.some((role: string) =>
      role.startsWith('PIA_USER'),
    );

    if (!hasSpecificUserRole && !isTrulyAdmin && !isManager) {
      this.logger.debug(
        `Usuário ${user?.userId} sem roles específicas de usuário, atribuindo PIA_USER`,
      );
      return ['PIA_USER'];
    }

    return userRoles;
  }

  getUserId(req: any): string {
    return req.user?.userId || 'anonymous';
  }

  /**
   * Compara dois userIds de forma case-insensitive
   * @param userId1 - Primeiro userId para comparação
   * @param userId2 - Segundo userId para comparação
   * @returns true se os userIds forem iguais (ignorando case)
   */
  private isSameUser(userId1: string, userId2: string): boolean {
    if (!userId1 || !userId2) {
      return false;
    }
    return userId1.toLowerCase() === userId2.toLowerCase();
  }

  /**
   * Valida se usuário pode acessar recurso de outro usuário
   * @param requestingUser - Usuário fazendo a requisição
   * @param targetUserId - ID do usuário dono do recurso
   * @param errorMessage - Mensagem de erro personalizada
   */
  validateUserAccess(
    requestingUser: any,
    targetUserId: string,
    errorMessage = 'Você só pode acessar seus próprios recursos',
  ): void {
    // Admin pode acessar qualquer recurso
    const effectiveRequestingUser = {
      ...requestingUser,
      roles: this.getEffectiveUserRoles(requestingUser),
    };
    if (this.isAdmin(effectiveRequestingUser)) {
      this.logger.debug(
        `Admin ${effectiveRequestingUser.userId} acessando recurso`,
      );
      return;
    }

    // Usuário comum só pode acessar seus próprios recursos
    // Comparação case-insensitive para evitar problemas com maiúsculas/minúsculas
    if (!this.isSameUser(this.getUserId(requestingUser), targetUserId)) {
      this.logger.warn(
        `User ${this.getUserId(requestingUser)} tentou acessar recurso do usuário ${targetUserId}`,
      );
      throw new Error(errorMessage);
    }
  }

  /**
   * Valida se usuário pode acessar recurso que ele criou
   * @param req - Request
   * @param resourceCreatedBy - ID de quem criou o recurso
   * @param errorMessage - Mensagem de erro personalizada
   */
  validateResourceOwnership(
    req: any,
    resourceCreatedBy: string,
    errorMessage = 'Você só pode acessar recursos que criou',
  ): void {
    this.logger.info(
      `Validando se usuário ${this.getUserId(req)} pode acessar recurso criado por ${resourceCreatedBy}`,
    );

    // Admin pode acessar qualquer recurso
    const effectiveUser = {
      ...req.user,
      roles: this.getEffectiveUserRoles(req.user),
    };
    if (this.isAdmin(effectiveUser)) {
      this.logger.debug(`Admin ${effectiveUser.userId} acessando recurso`);
      return;
    }

    this.logger.info(
      `getUserId: ${this.getUserId(req)}`,
      `resourceCreatedBy: ${resourceCreatedBy}`,
    );

    // Usuário comum só pode acessar recursos que criou
    // Comparação case-insensitive para evitar problemas com maiúsculas/minúsculas
    if (!this.isSameUser(this.getUserId(req), resourceCreatedBy)) {
      this.logger.warn(
        `User ${this.getUserId(req)} tentou acessar recurso criado por ${resourceCreatedBy}`,
      );
      throw new Error(errorMessage);
    }
  }

  /**
   * Helper para converter erros em ForbiddenException
   * @param fn - Função que pode lançar erro
   */
  executeWithAuthCheck(fn: () => void): void {
    try {
      fn();
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}
