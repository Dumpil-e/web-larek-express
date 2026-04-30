import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import ms from 'ms';
import Users from '../models/users';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import { generateTokens, setRefreshTokenCookie, verifyToken } from '../utils/tokens';
import env from '../config/env';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await Users.create(req.body);
    const tokens = generateTokens(user._id);

    user.tokens.push({ token: tokens.refreshToken });
    await user.save();

    const userResponse = { email: user.email, name: user.name };
    setRefreshTokenCookie(res, tokens.refreshToken, Number(ms(env.AUTH_REFRESH_TOKEN_EXPIRY)));

    return res.status(201).send({
      user: userResponse,
      success: true,
      accessToken: tokens.accessToken,
    });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Невалидные email или пароль'));
    }
    if (err.code === 11000) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email }).select('+password +tokens');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new UnauthorizedError('Неправильный email или пароль'));
    }
    const tokens = generateTokens(user._id);
    user.tokens.push({ token: tokens.refreshToken });
    await user.save();

    const userResponse = { email: user.email, name: user.name };
    setRefreshTokenCookie(res, tokens.refreshToken, Number(ms(env.AUTH_REFRESH_TOKEN_EXPIRY)));

    return res.send({
      user: userResponse,
      success: true,
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new BadRequestError('Отсутствует refresh-токен'));
    }

    const userId = verifyToken(refreshToken, env.JWT_SECRET);
    if (!userId) {
      return next(new BadRequestError('Невалидный refresh-токен'));
    }

    const user = await Users.findById(userId).select('+tokens');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    await user.save();

    // Удаляем куку
    res.cookie('refreshToken', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 0,
      path: '/',
    });

    return res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new UnauthorizedError('Отсутствует refresh-токен'));
    }

    const userId = verifyToken(refreshToken, env.JWT_SECRET);
    if (!userId) {
      return next(new UnauthorizedError('Невалидный refresh-токен'));
    }

    const user = await Users.findById(userId).select('+tokens');
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    if (!user.tokens.some((t) => t.token === refreshToken)) {
      return next(new UnauthorizedError('Refresh-токен отозван или не найден'));
    }

    const tokens = generateTokens(user._id);

    // Ротация токенов
    user.tokens = user.tokens.map((t) => (t.token === refreshToken
      ? { token: tokens.refreshToken } : t));
    await user.save();

    setRefreshTokenCookie(res, tokens.refreshToken, Number(ms(env.AUTH_REFRESH_TOKEN_EXPIRY)));

    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Требуется авторизация'));
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return next(new UnauthorizedError('Токен не предоставлен'));
    }

    const userId = verifyToken(accessToken, env.JWT_SECRET);
    if (!userId) {
      return next(new UnauthorizedError('Невалидный access-токен'));
    }

    const user = await Users.findById(userId);
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    return res.send({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (err) {
    return next(err);
  }
};
