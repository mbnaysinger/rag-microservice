import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigServerService } from '@shared/config/config.service';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { TransformInterceptor } from '@modules/common/interceptors/transform.interceptor';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const start = process.hrtime();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigServerService);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    }),
    new TransformInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          // Cria mensagens de erro mais detalhadas
          const field = error.property;
          const constraints = Object.values(error.constraints || {});
          return `Field '${field}': ${constraints.join(', ')}`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  // Configuração do Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Orquestrador de RAG')
    .setDescription('API do Orquestrador de RAG')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const swaggerPath =
    configService.get('config.swagger-path') || 'swagger-ui.html';
  SwaggerModule.setup(swaggerPath, app, document);

  // Log the Swagger path and server start information
  const appPort = configService.get('server.port') || 3000;

  const logger = app.get(Logger);

  await app.listen(appPort);

  logger.log(`Swagger documentation is available at: ${swaggerPath}`);
  logger.log(`Server started on port ${appPort} (http)`);

  const end = process.hrtime(start);
  const bootstrapTime = (end[0] * 1000 + end[1] / 1e6).toFixed(0);
  logger.log(`Application bootstrapped in ${bootstrapTime} ms`);
}

bootstrap();
