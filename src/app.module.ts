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
