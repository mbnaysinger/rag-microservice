import { Injectable } from '@nestjs/common';
import pino, { Logger } from 'pino';

@Injectable()
export class LoggerFactory {
  static getLogger(context: string): Logger {
    const isLocal = process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development';
    const level = process.env.NODE_ENV === 'test' ? 'debug' : 'info';

    const base = pino({
      level,
      base: { context, application: process.env.APPLICATION_NAME },
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: isLocal
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:yyyy-mm-dd\'T\'HH:MM:ss.l\'Z\'',
            },
          }
        : undefined,
    });

    return base;
  }
}
