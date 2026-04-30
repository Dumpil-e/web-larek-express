import { Router } from 'express';
import {
  register, login, logout, refreshAccessToken, getCurrentUser,
} from '../controllers/auth';
import checkAuth from '../middlewares/checkAuth';
import { validateUserBody } from '../middlewares/validations';

const auth = Router();

auth.post('/register', validateUserBody, register);
auth.post('/login', validateUserBody, login);
auth.get('/token', refreshAccessToken);
auth.get('/logout', logout);
auth.get('/user', checkAuth, getCurrentUser);

export default auth;
