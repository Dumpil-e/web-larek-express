import express from 'express';
import {
  getProduct, createProduct, updateProduct, deleteProduct,
} from '../controllers';
import { validateObjId, validateProductBody, validateProductUpdate } from '../middlewares/validations';
import checkAuth from '../middlewares/checkAuth';

const productRouter = express.Router();

productRouter.get('/', getProduct);
productRouter.post('/', checkAuth, validateProductBody, createProduct);
productRouter.patch('/:id', checkAuth, validateObjId, validateProductUpdate, updateProduct);
productRouter.delete('/:id', checkAuth, validateObjId, deleteProduct);

export default productRouter;
