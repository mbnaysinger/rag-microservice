import { LoggerFactory } from '@modules/common/utils/logger.factory';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = LoggerFactory.getLogger(TestJwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test-secret',
      algorithms: ['HS256'],
    });

    this.logger.debug(`Test JWT Strategy initialized.`);
  }

  async validate(payload: any) {
    this.logger.debug(`Validating payload: ${JSON.stringify(payload)}`);
    return {
      userId: payload.user_id,
      username: payload.preferred_username,
      roles: payload.roles,
    };
  }
}
