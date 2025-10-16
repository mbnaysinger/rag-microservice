import { LoggerFactory } from '@modules/common/utils/logger.factory';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import * as moment from 'moment-timezone';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger: Logger = LoggerFactory.getLogger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const httpStatusCodes = new Map([
      [400, 'Bad Request'],
      [401, 'Unauthorized'],
      [403, 'Forbidden'],
      [404, 'Not Found'],
      [409, 'Conflict'],
      [415, 'Unsupported Media Type'],
      [422, 'Unprocessable Entity'],
      [500, 'Internal Server Error'],
      [501, 'Not Implemented'],
      [502, 'Bad Gateway'],
      [503, 'Service Unavailable'],
      [504, 'Gateway Timeout'],
    ]);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorDescription = httpStatusCodes.get(status) || 'Unknown Error';
    const path = request.url.split('?')[0];

    const formattedDate = moment()
      .tz(process.env.TZ || 'UTC')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ');

    // Extrair informações detalhadas da exceção
    let message = exception.message || 'Error';
    let validationErrors = null;

    const exceptionResponse = exception.getResponse();

    // Capturar detalhes específicos de erros de validação
    if (
      exception instanceof BadRequestException &&
      typeof exceptionResponse === 'object'
    ) {
      const responseObj = exceptionResponse as any;

      // Captura mensagens de validação detalhadas
      if (responseObj.message && Array.isArray(responseObj.message)) {
        validationErrors = responseObj.message;
        message = 'Validation failed';
      }
    }

    const errorResponse = {
      error: errorDescription,
      status: status,
      message: message,
      timestamp: formattedDate,
      path: path,
    };

    // Adicionar erros de validação detalhados se existirem
    if (validationErrors) {
      errorResponse['validationErrors'] = validationErrors;
    }

    // Log apenas para erros 5xx (evita poluição do log com erros 4xx, como Forbidden)
    if (status >= 500) {
      if (validationErrors) {
        this.logger.error(
          `Validation Error: ${JSON.stringify(validationErrors)}`,
        );
        this.logger.error(`Request body: ${JSON.stringify(request.body)}`);
      } else {
        this.logger.error(`Error: ${message}`, exception);
      }
    }

    response.status(status).json(errorResponse);
  }
}
