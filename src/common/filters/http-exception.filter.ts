import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof Error) {
      if ((exception as any).response?.status) {
        const httpException = exception as any;
        status = httpException.status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = httpException.message || message;
      } else if (exception.name === 'BadRequestException') {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
      } else if (exception.name === 'NotFoundException') {
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
      } else if (exception.name === 'UnauthorizedException') {
        status = HttpStatus.UNAUTHORIZED;
        message = exception.message;
      } else if (exception.name === 'ForbiddenException') {
        status = HttpStatus.FORBIDDEN;
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: (request as any).url,
      message,
    });
  }
}
