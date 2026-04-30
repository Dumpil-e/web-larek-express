import { Request, Response, NextFunction } from 'express';
import UnauthorizedError from '../errors/unauthorized-error';
import { verifyToken } from '../utils/tokens'; // Твоя утилита
import env from '../config/env';

const checkAuth = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходимо авторизоваться'));
  }

  const token = authorization.split(' ')[1];

  try {
    const userId = verifyToken(token, env.JWT_SECRET);

    if (!userId) {
      return next(new UnauthorizedError('Невалидный токен'));
    }

    (req as any).userId = userId;

    return next();
  } catch (err) {
    return next(new UnauthorizedError('Ошибка авторизации'));
  }
};

export default checkAuth;
