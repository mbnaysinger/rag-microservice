import { Injectable } from '@nestjs/common';
import { LoggerFactory } from '@modules/common/utils/logger.factory';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

@Injectable()
export class RetryService {
  private readonly logger = LoggerFactory.getLogger('RetryService');

  /**
   * Executa uma função com retry automático
   * @param fn Função a ser executada
   * @param options Opções de configuração do retry
   * @returns Promise com o resultado da função
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelayMs = 1000,
      exponentialBackoff = true,
      onRetry,
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${maxAttempts}`);
        const result = await fn();

        if (attempt > 1) {
          // this.logger.info(
          //   `Operation succeeded on attempt ${attempt}/${maxAttempts}`,
          // );
        }

        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed: ${error.message}`,
        );

        if (onRetry) {
          onRetry(attempt, error);
        }

        // Se é a última tentativa, não faz delay e lança o erro
        if (attempt === maxAttempts) {
          this.logger.error(
            `All ${maxAttempts} attempts failed. Last error: ${error.message}`,
          );
          throw error;
        }

        // Calcula o delay
        const delayMs = exponentialBackoff
          ? baseDelayMs * Math.pow(2, attempt - 1)
          : baseDelayMs * attempt;

        this.logger.debug(
          `Waiting ${delayMs}ms before retry ${attempt + 1}/${maxAttempts}`,
        );

        // Aguarda antes da próxima tentativa
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  /**
   * Cria um decorator para métodos com configuração específica
   * @param options Opções de configuração do retry
   * @returns Decorator function
   */
  createRetryDecorator(options: RetryOptions = {}) {
    return (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor,
    ) => {
      const method = descriptor.value;
      LoggerFactory.getLogger(`${target.constructor.name}:${propertyName}`);
      descriptor.value = async function (...args: any[]) {
        return this.retryService?.executeWithRetry
          ? this.retryService.executeWithRetry(
              () => method.apply(this, args),
              options,
            )
          : method.apply(this, args);
      };

      return descriptor;
    };
  }
}
