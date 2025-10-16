import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigServerService } from '@modules/config/config.service';
import { LoggerFactory } from '@modules/common/utils/logger.factory';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = LoggerFactory.getLogger(JwtStrategy.name);

  constructor(private readonly configService: ConfigServerService) {
    const keycloakUri = configService.get('config.keycloak-uri');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `${keycloakUri}/protocol/openid-connect/certs`,
      }),
      algorithms: ['RS256'],
      passReqToCallback: true,
    });

    this.logger.info(`Keyclok Issuer URI: ${keycloakUri}`);
    // this.logger.info('JwtStrategy inicializado');
  }

  async validate(req: Request, payload: any) {
    // const method = req?.method || 'N/A';
    // const url = (req as any)?.originalUrl || req?.url || 'N/A';
    // this.logger.info(
    //   `Validando o token para o usuário: ${payload.preferred_username} - Endpoint: ${method} ${url}`,
    // );
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    const user = {
      userId: payload.user_id ? payload.user_id : null,
      username: payload.preferred_username ? payload.preferred_username : null,
      email: payload.email ? payload.email : null,
      organization: payload.org ? payload.org : null,
      department: payload.dept ? payload.dept : null,
      roles: payload.roles ? payload.roles : null,
      manager: payload.mgr ? payload.mgr : null,
    };

    return user;
  }
}
