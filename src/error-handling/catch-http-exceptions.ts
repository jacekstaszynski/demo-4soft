import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { DomainException } from './domain-exception';
import { ErrorResponse } from './error-response';

@Catch(HttpException, DomainException)
export class CatchHttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(CatchHttpExceptionFilter.name);

  constructor(private readonly host: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    return this.handleException(host, exception);
  }

  private handleException(host: ArgumentsHost, exception: HttpException) {
    const { httpAdapter } = this.host;
    const context = host.switchToHttp();
    const httpStatus = exception.getStatus();
    const message =
      exception.getResponse() instanceof Object
        ? (exception.getResponse() as { message: string }).message
        : exception.getResponse();

    const responseBody: ErrorResponse = {
      statusCode: httpStatus,
      statusDescription: HttpStatus[httpStatus],
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(context.getRequest()),
      message: message,
    };

    if (httpStatus !== 404 && httpStatus !== 401 && httpStatus !== 403) {
      this.logger.error(
        JSON.stringify({
          type: 'HttpException',
          message,
          status: httpStatus,
          path: httpAdapter.getRequestUrl(context.getRequest()),
          timestamp: new Date().toISOString(),
        }),
      );
    }
    return httpAdapter.reply(context.getResponse(), responseBody, httpStatus);
  }
}
