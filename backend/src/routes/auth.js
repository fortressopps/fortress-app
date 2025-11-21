import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  updatePassword,
  protect
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Todas as rotas abaixo precisam de autenticação
router.use(protect);

router.get('/me', getMe);
router.patch('/update-password', updatePassword);

export default router;