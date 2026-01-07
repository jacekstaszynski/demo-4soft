import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export class DomainException extends HttpException {
  public timestamp: Date;
  public value: number;

  constructor(response: string, status: HttpStatus, loggerClassName?: string) {
    if (loggerClassName) {
      const logger = new Logger(loggerClassName);
      logger.error(response);
    }

    super(response, status);
    this.timestamp = new Date();
  }
}
