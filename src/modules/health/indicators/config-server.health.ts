import { ConfigServerService } from '@modules/config/config.service';
import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class ConfigServerHealthIndicator extends HealthIndicator {
  constructor(private readonly configServerService: ConfigServerService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const config = this.configServerService.getConfig();

      if (!config || Object.keys(config).length === 0) {
        throw new Error('Configurações não carregadas');
      }

      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'ConfigServerService Health check failed',
        error,
      );
    }
  }
}
