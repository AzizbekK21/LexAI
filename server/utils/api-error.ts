import { Response } from 'express';

export function handleApiError(res: Response, error: unknown, message: string = 'Внутренняя ошибка сервера') {
  console.error(`API Error:`, error);
  const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
  res.status(500).json({ message, error: errorMessage });
}
