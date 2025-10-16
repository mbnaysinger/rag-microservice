import { Module } from '@nestjs/common';
import { ConfigServerService } from './config.service';

/**
 * Módulo NestJS responsável pelo gerenciamento centralizado de configurações.
 *
 * Este módulo encapsula o ConfigServerService e o disponibiliza para injeção de dependência
 * em toda a aplicação, fornecendo acesso centralizado e seguro às configurações.
 *
 * Funcionalidades:
 * - **Provedor Único**: Disponibiliza uma instância singleton do ConfigServerService
 * - **Exportação Global**: Permite que outros módulos importem e utilizem as configurações
 * - **Inicialização Automática**: Carrega configurações automaticamente na inicialização
 * - **Integração Simples**: Interface limpa para uso em outros módulos
 *
 * Uso em outros módulos:
 * ```typescript
 * @Module({
 *   imports: [ConfigServerModule],
 *   // ...
 * })
 * export class OutroModule {}
 * ```
 *
 * Injeção em serviços:
 * ```typescript
 * constructor(
 *   private readonly configService: ConfigServerService
 * ) {}
 * ```
 *
 * Principais integrações:
 * - **DatabaseModule**: Configurações de conexão com banco de dados
 * - **AuthModule**: Configurações de autenticação e autorização
 * - **HealthModule**: Verificação de integridade das configurações
 * - **Main Application**: Configurações gerais da aplicação
 *
 * @see ConfigServerService Para detalhes sobre funcionalidades de configuração
 */
@Module({
  providers: [ConfigServerService],
  exports: [ConfigServerService],
})
export class ConfigServerModule {}
