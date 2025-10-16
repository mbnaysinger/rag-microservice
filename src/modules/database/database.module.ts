import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigServerModule } from '@modules/config/config.module';
import { ConfigServerService } from '@modules/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigServerModule],
      inject: [ConfigServerService],
      useFactory: async (configService: ConfigServerService) => ({
        type: 'mysql',
        host: configService.get('config.db.host'),
        port: configService.get('config.db.port'),
        username: configService.get('config.db.username'),
        password: configService.get('config.db.password'),
        database: configService.get('config.db.database'),
        autoLoadEntities: true,
        synchronize: false, // Nunca use TRUE em produção!
        logging: false, // Defina como true para depurar queries SQL
      }),
    }),
  ],
})
export class DatabaseModule {}