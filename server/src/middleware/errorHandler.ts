import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: messages });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Dữ liệu đã tồn tại (trùng lặp)' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Lỗi hệ thống',
  });
}
