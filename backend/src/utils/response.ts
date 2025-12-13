import { Response } from 'express';

export interface SuccessResponse<T, M = undefined> {
  data: T;
  message?: string;
  meta?: M;
}

interface ResponseOptions<M> {
  status?: number;
  message?: string;
  meta?: M;
}

export const sendSuccess = <T, M = undefined>(
  res: Response,
  data: T,
  options: ResponseOptions<M> = {}
): Response => {
  const { status = 200, message, meta } = options;
  const payload: SuccessResponse<T, M> = {
    data
  };

  if (message) {
    payload.message = message;
  }

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
};
