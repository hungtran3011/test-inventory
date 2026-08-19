import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any;
}

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  // Ghi log toàn bộ chi tiết lỗi ở Server
  console.error(`[Error] ${req.method} ${req.url} >> StatusCode:: ${statusCode}`);
  console.error(err);

  // Ẩn chi tiết lỗi với Client. Nếu là lỗi 500 (Hệ thống/Database), trả về nội dung chung chung.
  const responseMessage = statusCode === 500 
    ? 'An unexpected internal server error occurred.' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    errors: err.errors || undefined
  });
};

/**
 * Handle 404 Not Found
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`
  });
};
