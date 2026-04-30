import Joi from 'joi';
import jwt from 'jsonwebtoken';
import ms from 'ms';

type Expiry = jwt.SignOptions['expiresIn'];

export interface Env {
  PORT: number;
  DB_ADDRESS: string;
  UPLOAD_PATH: string;
  UPLOAD_PATH_TEMP: string;
  ORIGIN_ALLOW: string;
  AUTH_ACCESS_TOKEN_EXPIRY: Expiry;
  AUTH_REFRESH_TOKEN_EXPIRY: Expiry;
  JWT_SECRET: string;
}

const validateMsFormat = (value: string): string => {
  if (ms(value as import('ms').StringValue) === undefined) {
    throw new Error('Должен быть влидный ms формат ( "10m", "7d", "1h")');
  }
  return value;
};

const validMsTime = Joi.string().custom(validateMsFormat, 'ms validation');

const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DB_ADDRESS: Joi.string().default('mongodb://127.0.0.1:27017/weblarek'),
  UPLOAD_PATH: Joi.string().default('images'),
  UPLOAD_PATH_TEMP: Joi.string().default('temp'),
  ORIGIN_ALLOW: Joi.string().required(),
  AUTH_ACCESS_TOKEN_EXPIRY: validMsTime.default('10m'),
  AUTH_REFRESH_TOKEN_EXPIRY: validMsTime.default('7d'),
  JWT_SECRET: Joi.string().min(16).required(),
}).unknown(true);

const { value, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  const details = error.details.map((d) => d.message).join('; ');
  throw new Error(`Некорректная конфигурация .env: ${details}`);
}

export default {
  ...value,
  AUTH_REFRESH_TOKEN_EXPIRY: value.AUTH_REFRESH_TOKEN_EXPIRY as unknown as import('ms').StringValue,
  AUTH_ACCESS_TOKEN_EXPIRY: value.AUTH_ACCESS_TOKEN_EXPIRY as unknown as import('ms').StringValue,
};
