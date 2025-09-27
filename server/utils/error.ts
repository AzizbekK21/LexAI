import { Response } from 'express';

export function handleError(res: Response, error: unknown, defaultMessage: string = 'Internal server error') {
  console.error('Error:', error);
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  res.status(500).json({ error: errorMessage });
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
