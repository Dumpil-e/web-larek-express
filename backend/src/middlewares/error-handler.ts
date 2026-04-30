import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.isJoi || err.name === 'CelebrateError') {
    return res.status(400).send({ message: err.details[0].message });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;

  return res.status(statusCode).send({ message });
};

export default errorHandler;
