import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body;
    if (items && items.length > 0) {
      const products = await Product.find({
        _id: { $in: items },
        price: { $ne: null },
      });
      if (products.length !== items.length) {
        return next(new BadRequestError('Некоторые товары не найдены или недоступны для продажи'));
      }
      const calculatedTotal = products.reduce((sum, p) => sum + (p.price as number), 0);
      if (calculatedTotal !== total) {
        return next(new BadRequestError('Сумма цен товаров не совпадает с общей ценой'));
      }
    }
    return res.status(201).send({
      id: faker.string.uuid(),
      total,
    });
  } catch (err) {
    return next(err);
  }
};

export default createOrder;
