import { Injectable } from '@nestjs/common';
import * as yaml from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Logger } from 'winston'; // Importe createLogger
import { LoggerFactory } from '@modules/common/utils/logger.factory';

/**
 * Serviço responsável pelo gerenciamento centralizado de configurações da aplicação.
 *
 * Este serviço oferece uma interface unificada para acesso a todas as configurações,
 * carregando-as de diferentes fontes de forma segura e eficiente:
 * - Arquivos YAML locais (.env.yml) para desenvolvimento
 * - Config Server remoto para ambientes de produção
 * - Variáveis de ambiente para configurações específicas
 *
 * Funcionalidades principais:
 * - **Carregamento Automático**: Configurações carregadas na inicialização da aplicação
 * - **Múltiplas Fontes**: Suporte a arquivos locais e servidores remotos de configuração
 * - **Segurança**: Carregamento seguro de informações sensíveis sem exposição em logs
 * - **Flexibilidade**: Configurações específicas por ambiente (local, k8s, produção)
 * - **Validação**: Verificação de integridade e disponibilidade das configurações
 * - **Performance**: Carregamento único com acesso rápido em memória
 *
 * Ambientes suportados:
 * - **local**: Carrega configurações do arquivo .env.yml na raiz do projeto
 * - **k8s/produção**: Carrega configurações de Config Server via HTTP
 * - **test**: Pula carregamento de configurações para otimizar testes
 *
 * Integrações:
 * - **DatabaseModule**: Configurações de conexão com MongoDB
 * - **AuthModule**: URLs e configurações do Keycloak
 * - **Main Application**: Portas, paths do Swagger e outras configurações gerais
 * - **HealthModule**: Verificação de integridade das configurações
 */
@Injectable()
export class ConfigServerService {
  private logger: Logger = LoggerFactory.getLogger(ConfigServerService.name);

  private config: Record<string, any> = {};
  private configLoaded = false;

  constructor() {
    if (this.configLoaded) {
      // this.logger.info('Configurations already loaded. Skipping.');
      return;
    }
    if (process.env.NODE_ENV === 'test') {
      // this.logger.info('Test context, ignoring application config.');
      return;
    }
    this.loadConfigurationsSync();
    this.configLoaded = true;
  }

  /**
   * Obtém o valor de uma configuração específica usando notação de ponto.
   *
   * Este método permite acesso a configurações aninhadas usando uma chave hierárquica,
   * facilitando a organização e acesso a configurações complexas.
   *
   * Exemplos de uso:
   * - `get('server.port')` → Obtém a porta do servidor
   * - `get('config.db.uri')` → Obtém a URI do banco de dados
   * - `get('config.keycloak-uri')` → Obtém a URL do Keycloak
   * - `get('config.swagger-path', 'swagger-ui.html')` → Obtém path do Swagger com fallback
   *
   * @param key - Chave da configuração usando notação de ponto (ex: 'config.db.uri')
   * @param defaultValue - Valor padrão retornado caso a configuração não seja encontrada
   * @returns O valor da configuração ou o valor padrão se não encontrado
   *
   * @example
   * ```typescript
   * // Configuração simples
   * const port = configService.get('server.port', 3000);
   *
   * // Configuração aninhada
   * const dbUri = configService.get('config.db.uri');
   *
   * // Com valor padrão
   * const swaggerPath = configService.get('config.swagger-path', 'api-docs');
   * ```
   */
  get(key: string, defaultValue?: any): any {
    const keys = key.split('.');
    let result = this.config;

    for (const k of keys) {
      result = result ? result[k] : undefined;
    }

    return result !== undefined ? result : defaultValue;
  }

  /**
   * Obtém todas as configurações carregadas.
   *
   * Este método retorna o objeto completo de configurações, útil para:
   * - Validações de integridade (health checks)
   * - Debugging e troubleshooting
   * - Análise completa das configurações disponíveis
   * - Implementação de funcionalidades que precisam de múltiplas configurações
   *
   * @returns Objeto contendo todas as configurações carregadas
   *
   * @example
   * ```typescript
   * // Verificação de integridade
   * const config = configService.getConfig();
   * if (!config || Object.keys(config).length === 0) {
   *   throw new Error('Configurações não carregadas');
   * }
   *
   * // Debug de configurações
   * console.log('Configurações disponíveis:', Object.keys(config));
   * ```
   */
  getConfig(): Record<string, any> {
    return this.config;
  }

  /**
   * Carrega as configurações de forma síncrona durante a inicialização.
   *
   * Este método determina a fonte de configuração baseada no ambiente e carrega
   * as configurações apropriadas. O carregamento é síncrono para garantir que
   * todas as configurações estejam disponíveis antes da aplicação inicializar.
   *
   * Fluxo de decisão:
   * 1. **NODE_ENV === 'local'**: Carrega do arquivo .env.yml na raiz do projeto
   * 2. **Outros ambientes**: Carrega do Config Server via HTTP usando CONFIG_SERVER_URL
   *
   * Tratamento de erros:
   * - Falhas no carregamento resultam em exceções que impedem a inicialização
   * - Logs detalhados são gerados para facilitar troubleshooting
   * - Mensagens de erro são localizadas em português
   *
   * @private
   * @throws {Error} Quando não é possível carregar configurações da fonte especificada
   *
   * @example
   * ```typescript
   * // Ambiente local - carrega .env.yml
   * NODE_ENV=local → Carrega /projeto/.env.yml
   *
   * // Ambiente produção - carrega do Config Server
   * NODE_ENV=production
   * CONFIG_SERVER_URL=https://config.example.com/app/prod
   * → Faz HTTP GET para o Config Server
   * ```
   */
  private loadConfigurationsSync() {
    const isConfigServerDisabled = process.env.NODE_ENV === 'local';

    if (isConfigServerDisabled) {
      try {
        const path = join(process.cwd(), '.env.yml');
        // this.logger.info(`Loading configurations from ${path} file.`);
        const yamlConfig = readFileSync(path, 'utf8');
        this.config = yaml.parse(yamlConfig);
        this.logger.info(
          'Configurations loaded from .env.yml file successfully.',
        );
      } catch (error) {
        this.logger.error(
          'Failed to load configurations from .env.yml file: ',
          error.message,
        );
        throw new Error(
          'Não foi possível carregar configurações do arquivo .env.yml',
        );
      }
    } else {
      // Carregar do Config Server
      const configServerUrl = process.env.CONFIG_SERVER_URL;
      // this.logger.info(
      //   `Loading configurations from Config Server: ${configServerUrl}`,
      // );
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const request = require('sync-request');
        const response = request('GET', configServerUrl);
        this.config = yaml.parse(response.getBody('utf8'));
        this.logger.info(
          'Configurations loaded from Config Server successfully.',
        );
      } catch (error) {
        this.logger.error(
          'Failed to load configurations from Config Server:',
          error.message,
        );
        throw new Error(
          'Não foi possível carregar configurações do Config Server',
        );
      }
    }
  }
}
