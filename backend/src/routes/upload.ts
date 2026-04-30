import { Router } from 'express';
import uploadFileMiddleware from '../middlewares/uploadFile';
import uploadFile from '../controllers/upload';
import checkAuth from '../middlewares/checkAuth';

const uploadRouter = Router();

uploadRouter.post('/', checkAuth, uploadFileMiddleware, uploadFile);

export default uploadRouter;
