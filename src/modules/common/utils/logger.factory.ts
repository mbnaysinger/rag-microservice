import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { createLogger, Logger } from 'winston';
import { WinstonLogger } from 'nest-winston';

@Injectable()
export class LoggerFactory {
  static getWinstonLogger(context: string): WinstonLogger {
    return new WinstonLogger(this.getLogger(context));
  }

  static getLogger(context: string): Logger {
    return createLogger({
      ...{
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
              }),
              winston.format.printf(
                (info) =>
                  `${info.timestamp} ${info.level.toUpperCase().slice(0, 5).padStart(5, ' ')} ${process.pid} --- [${process.env.APPLICATION_NAME}] ${(info.context as string).slice(0, 20).padEnd(20, ' ')} : ${info.stack || info.message}`,
              ),
            ),
            level: process.env.NODE_ENV === 'test' ? 'debug' : 'info',
          }),
          new winston.transports.File({
            filename: 'logs/application.log',
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
              }),
              winston.format.json(),
            ),
          }),
        ],
      },
      defaultMeta: { context },
    });
  }
}
