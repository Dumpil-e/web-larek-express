import express from 'express';
import createOrder from '../controllers/order';
import { validateOrderBody } from '../middlewares/validations';

const orderRouter = express.Router();

orderRouter.post('/', validateOrderBody, createOrder);

export default orderRouter;
