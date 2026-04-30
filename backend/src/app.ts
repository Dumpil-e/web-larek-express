import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import env from './config/env';
import {
  productRouter,
  orderRouter,
  authRouter,
  uploadRouter,
} from './routes';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';
import startTempCleanup from './utils/cleanup-temp';

const app = express();

mongoose.connect(env.DB_ADDRESS)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB Connected');

    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server started on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err);
    // process.exit(1);
  });

app.use(cors({
  origin: env.ORIGIN_ALLOW,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(requestLogger);
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/upload', uploadRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
startTempCleanup();
