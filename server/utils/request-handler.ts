import type { Request, Response } from 'express';

export type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

export function withErrorHandler(handler: AsyncRequestHandler, errorMessage: string) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`API Error: ${errorMessage}`, error);
      const errorDetails = error instanceof Error ? error.message : "Неизвестная ошибка";
      res.status(500).json({ message: errorMessage, error: errorDetails });
    }
  };
}
