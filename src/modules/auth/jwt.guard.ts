import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerFactory } from '@modules/common/utils/logger.factory';
import { Logger } from 'winston';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Retry } from '@retry/retry.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger: Logger = LoggerFactory.getLogger(JwtAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // Se não houver token, permite a requisição mas não define req.user
    if (!request.headers.authorization) {
      this.logger.debug(
        'No authorization header found, proceeding as anonymous',
      );
      return true;
    }

    return this.validateTokenWithRetry(context);
  }

  /**
   * Valida o token JWT com retry automático para falhas temporárias do JWKS
   */
  @Retry(3, 500) // 3 tentativas com delay de 500ms, 1000ms, 1500ms
  private async validateTokenWithRetry(
    context: ExecutionContext,
  ): Promise<boolean> {
    const result = super.canActivate(context);

    if (result instanceof Promise) {
      return result
        .then((value) => {
          return value;
        })
        .catch((error) => {
          // Verifica se é um erro temporário do JWKS (rate limit, timeout, etc.)
          if (this.isTemporaryJwksError(error)) {
            this.logger.warn(
              `Temporary JWKS error, will retry: ${error.message}`,
            );
            throw error; // Permite que o @Retry tente novamente
          }

          // Para outros erros (token inválido, expirado, etc.), não faz retry
          this.logger.warn('Invalid token provided');
          return true; // Permite requisição como anônimo
        });
    } else if (result instanceof Observable) {
      return from(result)
        .pipe(
          map((value) => {
            return value;
          }),
          catchError((err) => {
            if (this.isTemporaryJwksError(err)) {
              this.logger.warn(
                `Temporary JWKS error, will retry: ${err.message}`,
              );
              throw err; // Permite que o @Retry tente novamente
            }

            this.logger.warn('Invalid token provided', err);
            return from([true]); // Permite requisição como anônimo
          }),
        )
        .toPromise();
    } else {
      return result;
    }
  }

  /**
   * Verifica se o erro é temporário do JWKS (rate limit, timeout, conexão)
   */
  private isTemporaryJwksError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code;

    // Erros típicos de rate limiting do jwks-rsa
    if (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('too many requests') ||
      errorCode === 'ECONNRESET' ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'ETIMEDOUT' ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection')
    ) {
      return true;
    }

    return false;
  }
}
