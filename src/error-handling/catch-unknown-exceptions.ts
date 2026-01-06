import {
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorResponse } from './error-response';

export class CatchUnknownExceptions implements ExceptionFilter {
  private readonly logger: Logger = new Logger(CatchUnknownExceptions.name);

  constructor(private readonly host: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    return this.handleException(
      host,
      exception,
      exception?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private handleException(
    host: ArgumentsHost,
    exception: any,
    status?: HttpStatus,
  ) {
    const { httpAdapter } = this.host;
    const context = host.switchToHttp();
    const httpStatus = status || HttpStatus.BAD_REQUEST;
    const message = exception?.response?.message
      ? exception?.response?.message
      : exception?.message;
    const formattedMessage = Array.isArray(message)
      ? message.join(', ')
      : message;
    const responseBody: ErrorResponse = {
      statusCode: httpStatus,
      statusDescription: exception.cause?.toString(),
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(context.getRequest()),
      message: formattedMessage,
    };
    this.logger.error(`ERROR TYPE with MESSAGE: ${message}`);
    return httpAdapter.reply(context.getResponse(), responseBody, httpStatus);
  }
}
