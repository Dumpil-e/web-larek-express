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
  // eslint-disable-next-line no-console
  .then(() => console.log('MongoDB Connected'))
  // eslint-disable-next-line no-console
  .catch(console.error);

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
app.use(startTempCleanup);

app.listen(env.PORT, () => {

});
