import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import type { Request, Response } from "express";

type ErrorResponseBody = {
  code?: string;
  details?: unknown;
  message?: string | string[];
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const body = this.normalizeBody(exceptionResponse);

    response.status(status).json({
      success: false,
      error: {
        code: body.code ?? this.codeFromStatus(status),
        message: this.normalizeMessage(body.message),
        details: body.details
      },
      meta: {
        path: request.url,
        timestamp: new Date().toISOString()
      }
    });
  }

  private normalizeBody(exceptionResponse: unknown): ErrorResponseBody {
    if (!exceptionResponse) {
      return {};
    }

    if (typeof exceptionResponse === "string") {
      return {
        message: exceptionResponse
      };
    }

    if (typeof exceptionResponse === "object") {
      return exceptionResponse as ErrorResponseBody;
    }

    return {};
  }

  private codeFromStatus(status: number) {
    if (status === HttpStatus.BAD_REQUEST) {
      return "BAD_REQUEST";
    }

    if (status === HttpStatus.NOT_FOUND) {
      return "NOT_FOUND";
    }

    if (status === HttpStatus.SERVICE_UNAVAILABLE) {
      return "SERVICE_UNAVAILABLE";
    }

    return "INTERNAL_SERVER_ERROR";
  }

  private normalizeMessage(message?: string | string[]) {
    if (Array.isArray(message)) {
      return message.join("; ");
    }

    return message ?? "Internal server error";
  }
}
