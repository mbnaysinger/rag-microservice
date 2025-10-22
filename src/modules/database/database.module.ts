import { Module, Global } from '@nestjs/common';
import { ConfigServerModule } from '@modules/config/config.module';
import { MongoDBConnectionService } from './mongodb-connection.service';

@Global()
@Module({
  imports: [ConfigServerModule],
  providers: [MongoDBConnectionService],
  exports: [MongoDBConnectionService],
})
export class DatabaseModule {}
