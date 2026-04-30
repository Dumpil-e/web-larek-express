import { Request, Response, NextFunction } from 'express';
import UnauthorizedError from '../errors/unauthorized-error';
import { verifyToken } from '../utils/tokens';
import env from '../config/env';

const checkAuth = (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    [, token] = authHeader.split(' ');
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new UnauthorizedError('Необходимо авторизоваться'));
  }

  try {
    const userId = verifyToken(token, env.JWT_SECRET);
    if (!userId) {
      return next(new UnauthorizedError('Невалидный токен'));
    }
    (req as any).userId = userId;
    return next();
  } catch {
    return next(new UnauthorizedError('Ошибка авторизации'));
  }
};

export default checkAuth;
