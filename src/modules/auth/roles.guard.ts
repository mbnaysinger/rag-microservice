import { LoggerFactory } from '@modules/common/utils/logger.factory';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = LoggerFactory.getLogger(RolesGuard.name);

  constructor(private reflector: Reflector) {
    // this.logger.info('RolesGuard inicializado');
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      // this.logger.info('Nenhuma role necessária para esta rota.');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.debug(`Usuário no RolesGuard: ${JSON.stringify(user)}`);

    if (!user || !user.roles) {
      this.logger.debug(
        'Nenhum usuário ou roles encontrados, verificando se acesso anônimo é permitido',
      );
      if (requiredRoles.length > 0) {
        const method = request?.method || 'N/A';
        const url = request?.originalUrl || request?.url || 'N/A';
        this.logger.warn(
          `Acesso negado: Rota requer roles mas usuário é anônimo - Endpoint: ${method} ${url} - Roles requeridas: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException('Acesso negado: Autenticação necessária');
      }
      return true;
    }

    const hasRole = requiredRoles.some((requiredRole) =>
      user.roles.some((userRole) => userRole.startsWith(requiredRole)),
    );

    if (!hasRole) {
      const method = request?.method || 'N/A';
      const url = request?.originalUrl || request?.url || 'N/A';
      const username = user?.username || 'desconhecido';
      const userRoles = Array.isArray(user?.roles)
        ? user.roles.join(', ')
        : 'nenhuma';

      // Loga detalhes do acesso negado incluindo usuário e endpoint
      this.logger.warn(
        `Acesso negado para o usuário: ${username} - Endpoint: ${method} ${url} - Roles requeridas: ${requiredRoles.join(', ')} - Roles do usuário: ${userRoles}`,
      );

      throw new ForbiddenException(
        'Acesso negado: Usuário não possui as roles necessárias',
      );
    }

    return hasRole;
  }
}
