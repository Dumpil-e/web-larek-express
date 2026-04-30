import { Request, Response, NextFunction } from 'express';

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new Error('Файл не загружен'));
    }

    return res.json({
      fileName: `/temp/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (err) {
    return next(err);
  }
};

export default uploadFile;
