import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerFactory } from '@modules/common/utils/logger.factory';

export interface UserContext {
  userId: string;
  organization: string;
  department: string;
  roles?: string[];
}

export interface AnonymousUserConfig {
  organization: string;
  department: string;
  productId?: string; // Para configurações específicas por produto/chatbot
}

/**
 * Service para gerenciar contexto de usuário, incluindo usuários não autenticados
 * Fornece uma forma centralizada e configurável de lidar com contextos default
 */
@Injectable()
export class UserContextService {
  private readonly logger = LoggerFactory.getLogger(UserContextService.name);

  // Configurações padrão por produto/chatbot
  private readonly anonymousConfigs: Map<string, AnonymousUserConfig> =
    new Map();

  // Configuração padrão global
  private readonly defaultAnonymousConfig: AnonymousUserConfig = {
    organization: 'IEL',
    department: 'IEL',
  };

  constructor(private readonly configService: ConfigService) {
    this.initializeAnonymousConfigs();
  }

  /**
   * Inicializa configurações específicas para diferentes chatbots/produtos
   * Pode ser expandido para ler de configuração externa
   */
  private initializeAnonymousConfigs(): void {
    // Configuração específica para chatbot IEL
    this.anonymousConfigs.set('iel-chatbot', {
      organization: 'IEL',
      department: 'IEL',
    });

    // Adicione outras configurações conforme necessário
    // this.anonymousConfigs.set('fiergs-chatbot', {
    //   organization: 'FIERGS',
    //   department: 'Atendimento',
    // });

    this.logger.info('Anonymous user configurations initialized');
  }

  /**
   * Extrai contexto do usuário do request, com suporte para usuários não autenticados
   * @param req - Request object
   * @param productId - ID do produto/chatbot (opcional, para configurações específicas)
   * @returns UserContext com valores padrão quando não autenticado
   */
  getUserContext(req: any, productId?: string): UserContext {
    // Se usuário autenticado, retorna contexto completo
    if (req?.user) {
      return {
        userId: req.user.userId || req.user.sub || 'authenticated-user',
        organization: req.user.organization || req.user.org || 'default',
        department: req.user.department || req.user.dept || 'default',
        roles: req.user.roles || [],
      };
    }

    // Para usuários não autenticados, busca configuração específica ou usa padrão
    const config = this.getAnonymousConfig(productId);

    return {
      userId: 'anonymous',
      organization: config.organization,
      department: config.department,
      roles: [],
    };
  }

  /**
   * Obtém configuração para usuário anônimo baseada no produto/chatbot
   * @param productId - ID do produto/chatbot
   * @returns Configuração específica ou padrão
   */
  private getAnonymousConfig(productId?: string): AnonymousUserConfig {
    if (productId) {
      // Primeiro tenta buscar configuração específica por productId
      const specificConfig = this.anonymousConfigs.get(productId);
      if (specificConfig) {
        this.logger.debug(
          `Using specific anonymous config for product: ${productId}`,
        );
        return specificConfig;
      }
    }

    // Retorna configuração padrão
    this.logger.debug('Using default anonymous config');
    return this.defaultAnonymousConfig;
  }

  /**
   * Verifica se o contexto é de um usuário anônimo
   * @param context - UserContext
   * @returns true se for usuário anônimo
   */
  isAnonymous(context: UserContext): boolean {
    return context.userId === 'anonymous';
  }

  /**
   * Atualiza configuração de usuário anônimo para um produto específico
   * Útil para configuração dinâmica
   * @param productId - ID do produto/chatbot
   * @param config - Nova configuração
   */
  setAnonymousConfig(productId: string, config: AnonymousUserConfig): void {
    this.anonymousConfigs.set(productId, config);
    this.logger.info(`Updated anonymous config for product: ${productId}`);
  }

  /**
   * Obtém o ID do usuário do request ou retorna 'anonymous'
   * @param req - Request object
   * @returns User ID ou 'anonymous'
   */
  getUserId(req: any): string {
    return req?.user?.userId || req?.user?.sub || 'anonymous';
  }

  /**
   * Helper para verificar se request tem usuário autenticado
   * @param req - Request object
   * @returns true se autenticado
   */
  isAuthenticated(req: any): boolean {
    return !!req?.user;
  }
}
