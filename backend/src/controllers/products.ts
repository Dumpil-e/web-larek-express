import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import Product from '../models/product';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';

const TEMP_DIR = path.join(process.cwd(), 'src', 'public', 'temp');
const IMAGES_DIR = path.join(process.cwd(), 'src', 'public', 'images');

async function moveTempImageToPublic(tempFilePath: string): Promise<string> {
  const fileName = path.basename(tempFilePath); // извлекаем только имя файла
  const oldPath = path.join(TEMP_DIR, fileName);
  const newPath = path.join(IMAGES_DIR, fileName);

  // Создаём папку, если её нет
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  await fs.rename(oldPath, newPath);

  return `/images/${fileName}`;
}

export const getProduct = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();
    return res.send({ items: products, total: products.length });
  } catch (err) {
    return next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    let finalImage = image;
    if (image && image.fileName) {
      finalImage = {
        ...image,
        fileName: await moveTempImageToPublic(image.fileName),
      };
    }

    const product = await Product.create({
      title, image: finalImage, category, description, price,
    });
    return res.status(201).send(product);
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new NotFoundError('Товар не найден'));

    const {
      title, image, category, description, price,
    } = req.body;

    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;

    if (image && image.fileName) {
      if (product.image && product.image.fileName) {
        const oldFileName = path.basename(product.image.fileName);
        const oldPath = path.join(IMAGES_DIR, oldFileName);
        try { await fs.unlink(oldPath); } catch { /* empty */ }
      }
      product.image = {
        ...image,
        fileName: await moveTempImageToPublic(image.fileName),
      };
    }

    await product.save();
    return res.send(product);
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // findByIdAndDelete автоматически вызовет пост-хук в модели
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    return res.send(product);
  } catch (err) {
    return next(err);
  }
};
