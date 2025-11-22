// ~/fortress-app/backend/src/routes/supermarket.js
import express from 'express';
import {
  createList,
  getLists,
  getList,
  updateList,
  addItem,
  markItemPurchased,
  completeList,
  getAnalytics
} from '../controllers/supermarketController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Todas as rotas protegidas
router.use(protect);

// List management
router.route('/lists')
  .post(createList)
  .get(getLists);

router.route('/lists/:id')
  .get(getList)
  .patch(updateList);

// List completion
router.patch('/lists/:id/complete', completeList);

// Item management
router.post('/lists/:id/items', addItem);
router.patch('/lists/:listId/items/:itemId', markItemPurchased);

// Analytics
router.get('/analytics', getAnalytics);

export default router;