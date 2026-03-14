import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();
const transactionController = new TransactionController();

router.get('/users/me/transactions', authenticate, transactionController.getUserTransactions);

router.post('/transactions/:transactionId/pay', authenticate, transactionController.payTransaction);

export default router;
