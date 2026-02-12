import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // Log the full error securely (no sensitive data in logs)
    this.logger.error(
      `HTTP ${status} Error: ${request.method} ${request.url} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception)
    );

    // Return generic response without exposing internal details
    response.status(status).json({
      statusCode: status,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
