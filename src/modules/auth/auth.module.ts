import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { AuthorizationService } from './authorization.service';
import { UserContextService } from './user-context.service';
import { ConfigServerModule } from '@modules/config/config.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ConfigServerModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  providers: [
    JwtStrategy,
    RolesGuard,
    AuthorizationService,
    UserContextService,
  ],
  exports: [AuthorizationService, UserContextService],
})
export class AuthModule {}
