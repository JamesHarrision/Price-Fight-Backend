import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy Access Token. Vui lòng đăng nhập.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Access Token đã hết hạn hoặc không hợp lệ.' });
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Vui lòng đăng nhập!',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Bạn không có quyền thực hiện hành động này!',
    });
  }

  next();
};
