// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigServerModule } from './modules/config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from '@modules/health/health.module';
import { HttpExceptionFilter } from '@modules/common/filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { RetryModule } from './modules/common/retry/retry.module';
import { DocumentModule } from './modules/document/document.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'local'
          ? '.env.local'
          : process.env.NODE_ENV === 'k8s'
            ? '.env.k8s'
            : '',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'test' ? 'debug' : 'info',
        autoLogging: true,
        transport:
          process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: { colorize: true },
              }
            : undefined,
      },
    }),
    ConfigServerModule,
    AuthModule,
    DatabaseModule,
    HealthModule,
    RetryModule,
    DocumentModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
