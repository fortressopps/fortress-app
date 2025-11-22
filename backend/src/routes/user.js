// backend/src/routes/user.js
import express from 'express';
import { protect } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);

// 🚧 PLACEHOLDER - IMPLEMENTAR DEPOIS
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User dashboard endpoint - Em desenvolvimento',
    data: null
  });
});

export default router;