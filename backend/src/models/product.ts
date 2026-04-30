import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  }
  category: string;
  description?: string;
  price?: number | null;
}

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 30,
  },
  image: {
    type: {
      fileName: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
      },
    },
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
});

productSchema.post('findOneAndDelete', async (doc: IProduct | null) => {
  if (doc?.image?.fileName) {
    const fileName = path.basename(doc.image.fileName);
    const filePath = path.join(process.cwd(), 'src', 'public', 'images', fileName);

    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.warn(`[Cleanup] Не удалось удалить файл ${filePath}: ${message}`);
    }
  }
});

export default mongoose.model<IProduct>('product', productSchema);
