import { LoggerFactory } from '@modules/common/utils/logger.factory';

/**
 * Decorator que implementa lógica de retry com delay progressivo
 * @param maxAttempts Número máximo de tentativas (padrão: 3)
 * @param baseDelayMs Delay base em milissegundos (padrão: 1000ms)
 */
export function Retry(maxAttempts: number = 3, baseDelayMs: number = 1000) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const logger = LoggerFactory.getLogger(
      `${target.constructor.name}:${propertyName}`,
    );

    descriptor.value = async function (...args: any[]) {
      let lastError: any;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          logger.debug(`Attempt ${attempt}/${maxAttempts} for ${propertyName}`);

          // Executa o método original
          const result = await method.apply(this, args);

          if (attempt > 1) {
            // logger.info(
            //   `Method ${propertyName} succeeded on attempt ${attempt}/${maxAttempts}`,
            // );
          }

          return result;
        } catch (error) {
          lastError = error;
          logger.warn(
            `Attempt ${attempt}/${maxAttempts} failed for ${propertyName}: ${error.message}`,
          );

          if (attempt === maxAttempts) {
            logger.error(
              `All ${maxAttempts} attempts failed for ${propertyName}. Last error: ${error.message}`,
            );
            throw error;
          }

          const delayMs = baseDelayMs * attempt;
          logger.debug(
            `Waiting ${delayMs}ms before retry ${attempt + 1}/${maxAttempts}`,
          );

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

/**
 * Decorator avançado que usa o RetryService injetado
 * Requer que a classe tenha uma propriedade 'retryService' injetada
 * @param options Opções de configuração do retry
 */
export function RetryWithService(
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    exponentialBackoff?: boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {},
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const logger = LoggerFactory.getLogger(
      `${target.constructor.name}:${propertyName}`,
    );

    descriptor.value = async function (...args: any[]) {
      // Verifica se o serviço está disponível
      if (
        this.retryService &&
        typeof this.retryService.executeWithRetry === 'function'
      ) {
        return this.retryService.executeWithRetry(
          () => method.apply(this, args),
          options,
        );
      } else {
        // Fallback para implementação original se o serviço não estiver disponível
        logger.warn(
          `RetryService not found in ${target.constructor.name}, using fallback retry`,
        );

        const {
          maxAttempts = 3,
          baseDelayMs = 1000,
          exponentialBackoff = true,
          onRetry,
        } = options;

        let lastError: any;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            logger.debug(
              `Attempt ${attempt}/${maxAttempts} for ${propertyName}`,
            );

            const result = await method.apply(this, args);

            if (attempt > 1) {
              logger.info(
                `Method ${propertyName} succeeded on attempt ${attempt}/${maxAttempts}`,
              );
            }

            return result;
          } catch (error) {
            lastError = error;
            logger.warn(
              `Attempt ${attempt}/${maxAttempts} failed for ${propertyName}: ${error.message}`,
            );

            if (onRetry) {
              onRetry(attempt, error);
            }

            if (attempt === maxAttempts) {
              logger.error(
                `All ${maxAttempts} attempts failed for ${propertyName}. Last error: ${error.message}`,
              );
              throw error;
            }

            const delayMs = exponentialBackoff
              ? baseDelayMs * Math.pow(2, attempt - 1)
              : baseDelayMs * attempt;

            logger.debug(
              `Waiting ${delayMs}ms before retry ${attempt + 1}/${maxAttempts}`,
            );

            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }

        throw lastError;
      }
    };

    return descriptor;
  };
}
