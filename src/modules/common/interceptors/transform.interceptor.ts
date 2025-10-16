import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
      );
      result[snakeKey] = toSnakeCase(obj[key]);
    }
    return result;
  }
  return obj;
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/(_[a-z])/g, (match) =>
        match[1].toUpperCase(),
      );
      result[camelKey] = toCamelCase(obj[key]);
    }
    return result;
  }
  return obj;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Transforma entrada (body) de snake_case para camelCase
    if (request.body) {
      request.body = toCamelCase(request.body);
    }

    // Transformar também os parâmetros de consulta (query)
    if (request.query) {
      request.query = toCamelCase(request.query);
    }

    // Transformar params (parâmetros de rota)
    if (request.params) {
      request.params = toCamelCase(request.params);
    }

    // Transforma saída (resposta) de camelCase para snake_case
    return next.handle().pipe(
      map((data) => {
        if (!data) return data;
        return toSnakeCase(data);
      }),
    );
  }
}
