import { Module } from '@nestjs/common';
import { TerminusModule, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './api/rest/health.controller';
import { ConfigServerHealthIndicator } from './indicators/config-server.health';
import { ConfigServerService } from '@modules/config/config.service';

@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
    TypeOrmModule,
  ],
  controllers: [HealthController],
  providers: [
    TypeOrmHealthIndicator,
    ConfigServerHealthIndicator,
    ConfigServerService,
  ],
})
export class HealthModule {}
