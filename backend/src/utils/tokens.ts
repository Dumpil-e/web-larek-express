import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import env from '../config/env';

export function generateTokens(userId: string | Types.ObjectId) {
  const id = typeof userId === 'string' ? userId : userId.toString();
  const accessToken = jwt.sign(
    { _id: id },
    env.JWT_SECRET,
    { expiresIn: env.AUTH_ACCESS_TOKEN_EXPIRY },
  );

  const refreshToken = jwt.sign(
    { _id: id },
    env.JWT_SECRET,
    { expiresIn: env.AUTH_REFRESH_TOKEN_EXPIRY },
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token: string, secret: string): string | null {
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & { _id?: string };
    if (!decoded?._id) return null;
    return decoded._id;
  } catch {
    return null;
  }
}

export function setRefreshTokenCookie(res: Response, token: string, maxAgeMs: number) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: maxAgeMs,
    path: '/',
  });
}
