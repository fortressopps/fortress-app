/**
 * Aggregator de rotas - src/routes/index.js
 * Importe e use cada rota específica no express app
 */
import express from "express";
import accountsRouter from './accounts/index.js';
import analyticsRouter from './analytics/index.js';
import authRouter from './auth/index.js';
import battleRouter from './battle/index.js';
import billsRouter from './bills/index.js';
import budgetRouter from './budget/index.js';
import investmentsRouter from './investments/index.js';
import supermarketRouter from './supermarket/index.js';
import transactionsRouter from './transactions/index.js';
import userRouter from './user/index.js';

const router = express.Router();
router.use('/accounts', accountsRouter);
router.use('/analytics', analyticsRouter);
router.use('/auth', authRouter);
router.use('/battle', battleRouter);
router.use('/bills', billsRouter);
router.use('/budget', budgetRouter);
router.use('/investments', investmentsRouter);
router.use('/supermarket', supermarketRouter);
router.use('/transactions', transactionsRouter);
router.use('/user', userRouter);

export default router;
