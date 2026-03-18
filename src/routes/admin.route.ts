import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorizedAdmin } from '../middlewares/auth.middleware';

const router = Router();
const adminController = new AdminController();

router.get('/stats', authenticate, authorizedAdmin, adminController.getStats);
router.put('/users/:userId', authenticate, authorizedAdmin, adminController.updateUser);
router.post('/jobs/cleanup-tokens', authenticate, authorizedAdmin, adminController.manualTriggerCleanupTokens);
router.get('/transactions', authenticate, authorizedAdmin, adminController.getAllTransactions);

export default router;
