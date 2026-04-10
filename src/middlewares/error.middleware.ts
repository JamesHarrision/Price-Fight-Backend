import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const globalErrorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Lỗi hệ thống nội bộ';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    console.error('🔥 [LỖI HỆ THỐNG GHI NHẬN TẠI MIDDLEWARE]:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};
