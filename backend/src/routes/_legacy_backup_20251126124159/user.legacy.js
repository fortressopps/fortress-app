// backend/src/routes/user.js
import express from 'express';
import {
  getDashboard,
  getProfile,
  updateProfile,
  getMetrics,
  getBattleReport
} from '../controllers/userController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Todas as rotas protegidas
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboard);

// Profile management
router.route('/profile')
  .get(getProfile)
  .patch(updateProfile);

// Metrics and analytics
router.get('/metrics', getMetrics);

// Battle system
router.get('/battle-report', getBattleReport);

export default router;