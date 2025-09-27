import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ZodError } from 'zod';

// Расширяем тип Request из Express
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Ошибки
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Интерфейсы
interface ErrorResponse {
  message: string;
  error?: string | object;
  status: number;
}

// Вспомогательные функции
const createErrorResponse = (error: unknown, defaultMessage: string = 'Internal server error'): ErrorResponse => {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return {
      message: error.message,
      error: error.details,
      status: error.status
    };
  }

  if (error instanceof ZodError) {
    return {
      message: 'Validation error',
      error: error.errors,
      status: 400
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || defaultMessage,
      status: 500
    };
  }

  return {
    message: defaultMessage,
    status: 500
  };
};

const handleErrorResponse = (res: Response, error: unknown, defaultMessage?: string): void => {
  const errorResponse = createErrorResponse(error, defaultMessage);
  res.status(errorResponse.status).json(errorResponse);
};

// Типы и middleware
export type AsyncRequestHandler<P = unknown, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void>;

export const withErrorHandling = <P = unknown, ResBody = any, ReqBody = any>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody>,
  errorMessage: string = 'Internal server error'
): RequestHandler<P, ResBody, ReqBody> => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      handleErrorResponse(res, error, errorMessage);
    }
  };
};

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  handleErrorResponse(res, error);
};
